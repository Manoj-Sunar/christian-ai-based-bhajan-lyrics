import { AllSongsResponse, SongDetailsResponse } from "../types";
import { apiClient } from "./apiService"

export const publicApi = {

    register: async (body: { name: string, email: string, password: string }) => {
        return apiClient.post("/auth/register", body);
    },

    login: async (body: { email: string, password: string }) => {
        return apiClient.post("/auth/login", body);
    },





    // get all songs
    getAllSongs:async()=>{
        return apiClient.get<AllSongsResponse>("/songs");
    },


    getSongById:async(id:string)=>{
        return apiClient.get<SongDetailsResponse>(`/songs/${id}`)
    },



    convertLyrics:async(id:string,language:string)=>{
        return apiClient.post(`/songs/convert/${id}`,{language:language});
    }

}