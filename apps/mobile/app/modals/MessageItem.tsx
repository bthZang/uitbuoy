import { Text, View } from 'react-native';
import { Message, useProfileQuery } from '../../src/gql/graphql';

type Props = {
    message: Message;
};

export default function MessageItem({ message }: Props) {
    const { data } = useProfileQuery({ fetchPolicy: 'cache-first' });

    const isSent = message.senderId == data.profile.id.toString();

    return (
        <View
            className=" flex-row m-2"
            style={{
                justifyContent: isSent ? 'flex-end' : 'flex-start',
            }}
        >
            <Text
                className=" p-2 bg-primary-70 rounded-xl text-white font-medium"
                style={{ maxWidth: '80%' }}
            >
                {message.content}
            </Text>
        </View>
    );
}
