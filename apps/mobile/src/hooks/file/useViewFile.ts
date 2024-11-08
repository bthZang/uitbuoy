import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { useAuth } from '../../stores/auth.store';
import { getMimeTypeOfFile } from '../../utils/getMimeType';

export function useViewFile() {
    const { authData } = useAuth();

    async function viewFile(file: { fileurl?: string; filename?: string }) {
        const fileurl = file.fileurl
            .split('?')
            .slice(0, file.fileurl.split('?').length - 1)
            .join('');

        const filename = file.filename;

        const mimetype = getMimeTypeOfFile(filename);

        if (!fileurl) return;

        const fileUri = FileSystem.documentDirectory + `${filename}`;

        const downloadResumable = FileSystem.createDownloadResumable(
            `${fileurl}?token=${authData.token}`,
            fileUri,
            {},
        );

        try {
            const { uri } = await downloadResumable.downloadAsync();

            FileSystem.getContentUriAsync(uri).then((cUri) => {
                if (Platform.OS === 'ios') {
                    // Sharing.shareAsync(cUri.uri);
                } else {
                    IntentLauncher.startActivityAsync(
                        'android.intent.action.VIEW',
                        {
                            data: cUri,
                            flags: 1,
                            type: mimetype,
                        },
                    );
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    return viewFile;
}
