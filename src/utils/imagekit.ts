export const uploadToImageKit = async (imageFile: File): Promise<string> => {
    try {
        const privateKey = process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) throw new Error("ImageKit Private Key missing from ENV");
        
        const authString = btoa(privateKey + ":");

        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("fileName", imageFile.name);

        const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            headers: {
                Authorization: `Basic ${authString}`,
                Accept: 'application/json'
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
        
        const json = await response.json();
        return json.url;
    } catch (error) {
        console.error("ImageKit Error:", error);
        throw error;
    }
};
