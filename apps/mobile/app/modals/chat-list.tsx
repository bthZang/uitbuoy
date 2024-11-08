import { router, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import {
    FlatList,
    RefreshControl,
    TouchableNativeFeedback,
    View,
} from 'react-native';
import RoomItem from '../../src/components/RoomItem';
import TextField from '../../src/components/TextField/TextField';
import { useRoomsQuery } from '../../src/gql/graphql';
import SearchIcon from '../../src/icons/search';
import ChatListSkeleton from '../../src/skeletons/ChatListSkeleton';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function Page() {
    const navigation = useNavigation();

    const { data, loading, refetch } = useRoomsQuery({
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        navigation.setOptions({ title: 'Nhắn tin' });
    }, []);

    return (
        <View className=" flex-1 bg-white pt-0">
            <TouchableNativeFeedback
                onPress={() => {
                    router.push('/modals/chatSearch');
                }}
            >
                <View className=" rounded-2xl mx-4 px-4 py-3 bg-[#F2F2F2] flex flex-row gap-4 items-center">
                    <SearchIcon />
                    <TextField
                        editable={false}
                        fieldClassName=" text-sm"
                        title="Search"
                        type="text"
                        placeholder="Search for user..."
                    />
                </View>
            </TouchableNativeFeedback>
            {loading ? (
                <ChatListSkeleton></ChatListSkeleton>
            ) : (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    className=" flex-1 mt-4"
                >
                    <FlatList
                        className=" flex-1"
                        data={[...(data?.rooms || [])].sort(
                            (a, b) => b.lastMessage.date - a.lastMessage.date,
                        )}
                        renderItem={({ item }) => <RoomItem room={item} />}
                        keyExtractor={(item) => item.id}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={() => {
                                    refetch();
                                }}
                            />
                        }
                    />
                </Animated.View>
            )}
        </View>
    );
}
