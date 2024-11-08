const extToMimes = {
    img: 'image/jpeg',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    pdf: 'application/pdf',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    txt: 'text/plain',
    zip: 'application/zip',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    csv: 'text/csv',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export function getMimeTypeOfFile(fileName?: string) {
    if (!fileName) return 'application/pdf';

    const ext = fileName.split('.').at(-1);

    const mimeType = extToMimes?.[ext] || 'application/pdf';

    return mimeType;
}
