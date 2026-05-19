
import { apiClient } from "./apiService"

export const adminApi={
    createLyrics:async(body:any)=>{
        return apiClient.post("/admin/songs",body);
    },

    deleteLyrics:async(id:string)=>{
        return apiClient.delete(`/admin/songs/${id}`)
    }
}