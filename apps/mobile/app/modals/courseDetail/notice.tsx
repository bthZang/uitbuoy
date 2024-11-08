import { useEffect } from 'react';
import { FlatList, Image, ScrollView, Text, View } from 'react-native';
import {
    useCourseMakeUpClassLazyQuery,
    useGeneralDetailCourseQuery,
} from '../../../src/gql/graphql';
import PreviewMakeupClassSkeleton from '../../../src/skeletons/PreviewMakeupClassSkeleton';
import CourseMakeupClass from '../../../src/components/CourseMakeupClass';
import EMPTY_NOTICE_ICON from '../../../assets/empty-notice.png';

export default function NoticePage({ id }: { id: number }) {
    const { data: detailData } = useGeneralDetailCourseQuery({
        variables: { id },
    });

    const [refetch, { data, loading, error }] = useCourseMakeUpClassLazyQuery();

    useEffect(() => {
        if (detailData?.course)
            refetch({ variables: { courseCode: detailData.course.shortname } });
    }, [detailData?.course.id]);

    return (
        <View className=" flex-1 bg-white">
            <ScrollView style={{ paddingTop: 20 }} className=" flex-1">
                {loading || !data?.makeUpClass ? (
                    <PreviewMakeupClassSkeleton />
                ) : (
                    <>
                        <FlatList
                            contentContainerStyle={{
                                flexDirection: 'column',
                                gap: 8,
                            }}
                            scrollEnabled={false}
                            data={data.makeUpClass.filter(
                                ({ classId }) => classId === id.toString(),
                            )}
                            renderItem={({ item }) => (
                                <CourseMakeupClass makeupClass={item} />
                            )}
                            keyExtractor={(item) => item.title}
                        />
                    </>
                )}
                {data?.makeUpClass.length === 0 ? (
                    <View className=" flex-1 justify-center items-center">
                        <Image
                            style={{ width: 200, height: 200 }}
                            source={EMPTY_NOTICE_ICON}
                        />
                        <Text className=" mt-2 font-semibold text-lg">
                            Không có thông báo mới nào
                        </Text>
                    </View>
                ) : null}
            </ScrollView>
        </View>
    );
}
