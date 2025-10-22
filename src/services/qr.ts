import api from "../utils/axiosInstance"

export const generateQRCode = async (data: any) => {
    const res: any = await api.post('/qrcodes', data);
    return res.data;
}

export const getQRCodes = async (params:any) => {
    const res: any = await api.get('/qrcodes/my', { params });
    return res.data;
}

export const deleteQRCode = async (publicId: string) => {
    const res: any = await api.delete(`/qrcodes/${publicId}`);
    return res.data;
}

export const getQRCodeDetails = async (publicId: string) => {
    const res: any = await api.get(`/qrcodes/${publicId}`);
    return res.data;
}

export const updateQRCode = async (publicId: string, data: any) => {
    const res: any = await api.put(`/qrcodes/update/${publicId}`, data);
    return res.data;
}