import { AllSongsResponse, ConvertLyricsResponse, ExplainLyricsResponse, SongDetailsResponse } from "../types";
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


    getSongById:async(id:string,config?:any)=>{
        return apiClient.get<SongDetailsResponse>(`/songs/${id}`,config)
    },



    convertLyrics:async(id:string,language:string):Promise<ConvertLyricsResponse>=>{
        return apiClient.post(`/songs/convert/${id}`,{language:language});
    },

    explainLyrics:async(id:string,language:string):Promise<ExplainLyricsResponse>=>{
        return apiClient.post(`/songs/explain/${id}`,{language:language})
    }

}