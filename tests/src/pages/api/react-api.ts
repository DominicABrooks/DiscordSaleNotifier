import { APIResponse, Page } from '@playwright/test';

export default class ReactApiPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Makes a GET request to fetch the favicon.ico.
     * @param headers Optional headers to include in the request.
     * @returns A promise that resolves to an APIResponse object representing the response.
     */
    async getFavIcon(headers?: Record<string, string>): Promise<APIResponse> {
        const response = await this.page.request.get('/favicon.ico', { headers });
        return response;
    }

    /**
     * Makes a GET request to fetch the logo.png.
     * @param headers Optional headers to include in the request.
     * @returns A promise that resolves to an APIResponse object representing the response.
     */
    async getLogo(headers?: Record<string, string>): Promise<APIResponse> {
        const response = await this.page.request.get('/logo.png', { headers });
        return response;
    }

    /**
     * Makes a GET request to fetch the discord.svg.
     * @param headers Optional headers to include in the request.
     * @returns A promise that resolves to an APIResponse object representing the response.
     */
    async getDiscordSvg(headers?: Record<string, string>): Promise<APIResponse> {
        const response = await this.page.request.get('/discord.svg', { headers });
        return response;
    }
}