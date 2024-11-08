import { useNavigation } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import MessageItem from './MessageItem';
import {
    Message,
    useMessagesQuery,
    useProfileQuery,
} from '../../src/gql/graphql';
import { useDetailRoomRouter } from '../../src/stores/room-detail.store';
import TextField from '../../src/components/TextField/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import socket from '../../src/api/socket';

export default function Page() {
    const navigation = useNavigation();

    const { room } = useDetailRoomRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [content, setContent] = useState<string>();

    const { data, loading, refetch } = useMessagesQuery({
        variables: { id: room.id },
        fetchPolicy: 'network-only',
    });

    const { data: profile } = useProfileQuery();

    useEffect(() => {
        if (data) {
            navigation.setOptions({ title: room.user.fullname });
            setMessages(data.messages);
        } else navigation.setOptions({ title: 'Nhắn tin' });
    }, [data]);

    useEffect(() => {
        if (!profile) return;

        const listener = socket.on(
            `chat:${profile.profile.id.toString()}`,
            (data) => {
                setMessages((prev) => [data, ...prev]);
            },
        );

        return () => {
            if (!profile) return;
            socket.removeListener(`chat:${profile.profile.id.toString()}`);
        };
    }, [profile]);

    return (
        <View className=" flex-1 bg-white pt-0">
            {loading ? (
                <></>
            ) : (
                <View className=" flex-1" style={{ paddingBottom: 16 }}>
                    <FlatList
                        data={[...messages].reverse()}
                        renderItem={({ item }) => (
                            <MessageItem message={item} />
                        )}
                        keyExtractor={(item) => item.id}
                    />

                    <View className=" flex-row items-center gap-2 mx-4">
                        <View className=" flex-1">
                            <TextField
                                className=" border-[0.5px] rounded-xl py-2 px-4"
                                fieldClassName=""
                                value={content}
                                onChangeText={(value) => setContent(value)}
                                title=""
                                type="none"
                                placeholder="Nhập tin nhắn tại đây"
                            />
                        </View>
                        <PrimaryButton
                            onPress={() => {
                                setContent('');
                                if (!profile) return;
                                socket.emit('chat', {
                                    content,
                                    senderId: profile.profile.id.toString(),
                                    receiverId: room.id,
                                } as Message);
                                setMessages((prev) => [
                                    {
                                        id: content,
                                        content,
                                        senderId: profile.profile.id.toString(),
                                        receiverId: room.id,
                                        date: new Date().getTime(),
                                    },
                                    ...prev,
                                ]);
                            }}
                        >
                            <Text className=" text-white py-2 font-semibold">
                                OK
                            </Text>
                        </PrimaryButton>
                    </View>
                </View>
            )}
        </View>
    );
}
