import { Spinner } from '@gluestack-ui/themed';
import { useEffect } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseItem from '../../src/components/CourseItem';
import CourseSearch from '../../src/components/CourseSearch/CourseSearch';
import PageHeader from '../../src/components/PageHeader';
import { useUserCoursesLazyQuery } from '../../src/gql/graphql';
import CourseListSkeleton from '../../src/skeletons/CourseListSkeleton';
import Animated, { FadeInLeft, FadeOutLeft } from 'react-native-reanimated';
import { useRecentCourse } from '../../src/stores/recent-course.store';
import RecentCourseItem from '../../src/components/RecentCourseItem';

export default function Page() {
    const [fetchCourses, { data: courses, loading, error, refetch }] =
        useUserCoursesLazyQuery();

    const { recentCourses } = useRecentCourse();

    useEffect(() => {
        fetchCourses({
            variables: { isNew: true, isRecent: true },
            fetchPolicy: 'cache-and-network',
        });
    }, []);

    return (
        <View className=" flex-1 bg-white">
            <SafeAreaView style={{ flex: 1 }}>
                <PageHeader />
                <CourseSearch />
                <ScrollView
                    className=" flex-1 mt-6"
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={() => {
                                fetchCourses({
                                    variables: { isNew: true, isRecent: true },
                                    fetchPolicy: 'network-only',
                                });
                            }}
                        />
                    }
                >
                    <View className=" flex pb-[120px]">
                        {recentCourses.length ? (
                            <View className=" mb-4">
                                <ScrollView horizontal className="">
                                    <View className=" px-4 py-2 flex-row gap-4">
                                        {recentCourses.map((course) => (
                                            <RecentCourseItem
                                                key={course.id}
                                                {...course}
                                            />
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        ) : null}
                        {loading ? (
                            <>
                                <CourseListSkeleton />
                            </>
                        ) : (
                            courses?.userCourses.map((course, index) => (
                                <Animated.View
                                    key={course.id}
                                    entering={FadeInLeft.delay(
                                        (index + 1) * 100,
                                    )}
                                    exiting={FadeOutLeft}
                                >
                                    <CourseItem {...course} />
                                </Animated.View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
