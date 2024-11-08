import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text, TouchableNativeFeedback, View } from 'react-native';
import Animated, { FadeInLeft, FadeOutLeft } from 'react-native-reanimated';
import EMPTY_REMAINING_ACTIVITIES from '../../assets/empty-remaining-activities.png';
import NOTE_TEXT from '../../assets/note-text.png';
import EventListSkeleton from '../skeletons/EventListSkeleton';
import { useEvents } from '../stores/event.store';
import { timeDiff } from '../utils/timeDiff';
import HeaderButton from './HeaderButton';

export default function RemainingActivities() {
    const { events, refetch, loading } = useEvents();

    return (
        <View className=" flex mt-0">
            <HeaderButton
                icon={NOTE_TEXT}
                title="Các bài tập sắp đến hạn"
                subTitle="Danh sách các bài tập trong tất cả các lớp ở học kỳ này"
            />
            <View className=" flex py-0">
                {loading ? (
                    <EventListSkeleton />
                ) : (
                    events.map(({ id, activityname, timestart, course }, i) => (
                        <Animated.View
                            key={id}
                            entering={FadeInLeft.delay((i + 1) * 100)}
                            exiting={FadeOutLeft}
                            className=" flex"
                        >
                            <TouchableNativeFeedback
                                onPress={() => {
                                    router.push({
                                        pathname: '/modals/detail-activity',
                                        params: {
                                            id,
                                            assignment_id: events[i].instance,
                                            course_id: events[i].course.id,
                                        },
                                    });
                                }}
                            >
                                <View
                                    style={{ borderColor: '#CFCFCF' }}
                                    className=" flex px-4 py-4 border-[0.5px]"
                                >
                                    <View className=" flex flex-col justify-between items-start gap-4">
                                        <View className=" flex flex-row gap-2">
                                            <Text
                                                className={` px-3 py-1 flex justify-center items-center rounded-lg bg-primary-70 text-white text-center font-medium text-sm`}
                                            >
                                                {
                                                    -timeDiff(
                                                        new Date(
                                                            timestart * 1000,
                                                        ),
                                                    ).time
                                                }{' '}
                                                {
                                                    timeDiff(
                                                        new Date(
                                                            timestart * 1000,
                                                        ),
                                                    ).type
                                                }
                                            </Text>
                                        </View>
                                        <View className=" flex flex-col gap-1">
                                            <Text className=" text-sm text-zinc-500">
                                                {course.fullname
                                                    .split(' - ')
                                                    .at(0)}
                                            </Text>
                                            <Text className=" text-lg font-medium">
                                                {activityname}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableNativeFeedback>
                        </Animated.View>
                    ))
                )}
                {events.length === 0 && !loading ? (
                    <View className=" flex-1">
                        <Image
                            style={{
                                flex: 1,
                                width: '100%',
                                height: 230,
                                marginTop: 20,
                            }}
                            contentFit="contain"
                            transition={1000}
                            source={EMPTY_REMAINING_ACTIVITIES}
                        />
                        <Text className=" text-center font-semibold text-lg">
                            Không có bài tập nào
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}
