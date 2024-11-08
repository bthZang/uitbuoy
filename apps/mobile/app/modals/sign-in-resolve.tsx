import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInUp,
    FadeOut,
    FadeOutUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import SLANG_TO_THE_MOON from '../../assets/slang-to-the-moon.png';
import NativeButton from '../../src/components/NativeButton/NativeButton';
import ProgressText from '../../src/components/ProgressText';
import { useUserCoursesLazyQuery } from '../../src/gql/graphql';
import { useAuth } from '../../src/stores/auth.store';
import { useEvents } from '../../src/stores/event.store';

export default function SignInResolve() {
    const { isLogin, authData } = useAuth();
    const [getCourses, { data: coursesData, loading: coursesLoading }] =
        useUserCoursesLazyQuery({
            fetchPolicy: 'network-only',
        });
    const { events, refetch, loading } = useEvents();

    useEffect(() => {
        if (isLogin) {
            refetch();
            getCourses({
                variables: {
                    isNew: true,
                    isRecent: false,
                },
                onCompleted(data) {
                    refetch();
                },
            });
        }
    }, [isLogin]);

    return (
        <View className=" flex-1 bg-white">
            <SafeAreaView style={{ flex: 1 }} className="">
                <Animated.View
                    entering={FadeIn.delay(100)}
                    exiting={FadeOut}
                    style={{ paddingVertical: 100 }}
                    className=""
                >
                    <View className=" flex flex-col items-center gap-2">
                        <Image
                            style={{
                                width: 200,
                                height: 200,
                                marginBottom: 20,
                            }}
                            source={SLANG_TO_THE_MOON}
                        />
                        <Text className=" text-2xl font-medium">
                            Đăng nhập thành công
                        </Text>
                        <Text className=" font-light">
                            Đang lấy dữ liệu từ hệ thống courses
                        </Text>
                    </View>
                </Animated.View>
                <View className=" flex-1 pt-0">
                    <View className=" flex-1 mx-4 flex-col gap-4">
                        <Animated.View
                            entering={FadeIn.delay(300)}
                            exiting={FadeOut}
                        >
                            <ProgressText
                                loaded={!!coursesData}
                                loading={coursesLoading || !isLogin}
                                title="Lấy danh sách khóa học"
                                description="Tải danh sách các lớp học của bạn từ hệ thống course của UIT"
                            />
                        </Animated.View>
                        <Animated.View
                            entering={FadeIn.delay(500)}
                            exiting={FadeOut}
                        >
                            <ProgressText
                                loaded={!!events}
                                loading={loading || !isLogin}
                                title="Lấy danh sách bài tập"
                                description="Tải danh sách bài tập của bạn từ hệ thống course của UIT"
                            />
                        </Animated.View>
                    </View>
                </View>
                {events ? (
                    <Animated.View
                        entering={FadeInUp}
                        exiting={FadeOutUp}
                        className=" mx-4 p-4"
                    >
                        <NativeButton onPress={() => router.replace('/')}>
                            <View className=" p-4 flex flex-row justify-center bg-primary-60">
                                <Text className=" font-medium text-white">
                                    Đến trang chủ
                                </Text>
                            </View>
                        </NativeButton>
                    </Animated.View>
                ) : null}
            </SafeAreaView>
        </View>
    );
}
