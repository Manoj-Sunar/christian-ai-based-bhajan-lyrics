import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {

    private readonly apiKey: string;
    private readonly model: string;

    constructor(
        private readonly config: ConfigService,

    ) {

        this.apiKey =
            this.config.get<string>(
                'OPEN_ROUTER_API_KEY',
            )!;

        this.model =
            this.config.get<string>(
                'OPEN_ROUTER_MODEL',
            )!;

        if (!this.apiKey) {
            throw new Error(
                'OPEN_ROUTER_API_KEY missing',
            );
        }

        if (!this.model) {
            throw new Error(
                'OPEN_ROUTER_MODEL missing',
            );
        }



    }



    async generate(prompt: string) {

        try {

            const response =
                await axios.post(

                    'https://openrouter.ai/api/v1/chat/completions',

                    {
                        model: this.model,

                        messages: [
                            {
                                role: 'user',
                                content: prompt,
                            },
                        ],
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${this.apiKey}`,

                            'Content-Type':
                                'application/json',
                        },
                    },
                );

            return response.data
                .choices[0]
                .message.content;

        } catch (error: any) {

            console.error(
                error.response?.data || error,
            );

            throw new Error(
                'OpenRouter AI generation failed',
            );
        }
    }


  



}