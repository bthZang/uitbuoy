import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Text, TouchableNativeFeedback, View } from 'react-native';
import REST_TIME_RIGHT from '../../assets/rest-time-right.png';
import HAS_DEADLINE_ICON from '../../assets/small-has-deadline-icon.png';
import { Course } from '../gql/graphql';
import { useDeadline } from '../hooks/course/useDeadline';
import DeadlineSkeleton from '../skeletons/DeadlineSkeleton';
import { useRecentCourse } from '../stores/recent-course.store';

export default function CourseItem({
    fullname,
    display_name,
    idnumber,
    shortname,
    courseimage,
    id,
}: Partial<Course>) {
    // const { hasDeadline, mostRecentActivity, loading } = useDeadline(id);

    const { addRecentCourse } = useRecentCourse();

    return (
        <TouchableNativeFeedback
            onPress={() => {
                addRecentCourse({ display_name, shortname, id });
                router.push({
                    pathname: `/modals/courseDetail`,
                    params: { display_name, shortname, id, idnumber },
                });
            }}
        >
            <View
                style={{ borderColor: '#CFCFCF' }}
                className=" border-[0.5px] p-4 px-6 flex flex-row items-end gap-4"
            >
                <View className=" flex-1">
                    <Text className=" text-lg font-medium">{display_name}</Text>
                    <Text className=" font-light mt-1">
                        {idnumber || shortname}
                    </Text>
                </View>
                {/* {loading ? (
                    <DeadlineSkeleton />
                ) : (
                )} */}
                {/* <View>
                    {hasDeadline ? (
                        <Image
                            source={HAS_DEADLINE_ICON}
                            style={{ width: 50, height: 30 }}
                        />
                    ) : (
                        <Image
                            source={REST_TIME_RIGHT}
                            style={{ width: 40, height: 40 }}
                        />
                    )}
                </View> */}
            </View>
        </TouchableNativeFeedback>
    );
}
