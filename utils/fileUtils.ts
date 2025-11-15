declare const mammoth: any;
declare const JSZip: any;

export const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // result is in format "data:[mimeType];base64,[base64string]"
            const base64 = result.split(',')[1];
            const mimeType = result.split(';')[0].split(':')[1];
            if (base64 && mimeType) {
                resolve({ base64, mimeType });
            } else {
                reject(new Error('Failed to parse file data.'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (error) => reject(error);
    });
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch(e) {
        console.error("Error processing DOCX file:", e);
        throw new Error("Failed to process the DOCX file. It might be corrupted.");
    }
};

export const extractTextFromPptx = async (file: File): Promise<string> => {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slidePromises: Promise<string>[] = [];
        
        zip.folder("ppt/slides")?.forEach((relativePath, file) => {
            if (relativePath.startsWith("slide") && !relativePath.includes("rels") && relativePath.endsWith(".xml")) {
                slidePromises.push(file.async("string"));
            }
        });

        const slideXmls = await Promise.all(slidePromises);
        
        const textFromSlides = slideXmls
            .map(xml => {
                const texts = [...xml.matchAll(/<a:t>([^<]+)<\/a:t>/g)].map(match => match[1]);
                return texts.join(' ');
            })
            .join('\n\n'); 

        if (!textFromSlides.trim()) {
            return "Could not extract any text from the presentation. The file might contain only images, or the text is in an unsupported format.";
        }
        return textFromSlides;

    } catch (e) {
        console.error("Error processing PPTX file:", e);
        throw new Error("Failed to process the PPTX file. It might be corrupted or in an unsupported format.");
    }
};