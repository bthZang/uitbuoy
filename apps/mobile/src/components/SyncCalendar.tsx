import { Text, TouchableNativeFeedback, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSyncEvent } from '../hooks/events/useSyncEvent';
import { useGoogleSignin } from '../hooks/google/useGoogleSignin';
import { useAuth } from '../stores/auth.store';
import NativeButton from './NativeButton/NativeButton';
import { router } from 'expo-router';

export default function SyncCalendar() {
    const { signIn } = useGoogleSignin();
    const { syncEvent } = useSyncEvent();
    const { isIntegrateWithGoogle } = useAuth();

    return !isIntegrateWithGoogle ? (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className=" mt-4 py-4 px-6 rounded-none bg-primary-95"
        >
            <Text className=" text-xl text-primary-20 font-bold">
                Đồng bộ với Google
            </Text>
            <Text className=" mt-2">
                Dễ dàng quản lý hạn nộp bài hơn khi tích hợp với Google Calendar
            </Text>
            <View className=" mt-3 self-end flex items-center">
                <TouchableNativeFeedback
                    onPress={async () => {
                        await signIn();
                        await syncEvent();
                    }}
                >
                    <View className=" w-min py-3 px-5 bg-primary-60 rounded-xl">
                        <Text className=" w-min font-semibold text-white">
                            Đồng bộ ngay
                        </Text>
                    </View>
                </TouchableNativeFeedback>
            </View>
        </Animated.View>
    ) : (
        <NativeButton
            borderRadius={0}
            onPress={() => router.push('/modals/google-integration')}
        >
            <View style={{ backgroundColor: '#92FBBF' }} className=" p-4">
                <Text className=" font-medium text-sm">
                    Bạn đã liên kết với tài khoản Google và các bài tập sẽ được
                    tự động đồng bộ với Google Calendar
                </Text>
            </View>
        </NativeButton>
    );
}
