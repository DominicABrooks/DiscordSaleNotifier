import { APIRequestContext, APIResponse, Page, request } from '@playwright/test';

export default class ReactApiPage {
    private apiRequestContext: APIRequestContext;
    private page: Page;

    constructor(page: Page)
    {
        this.page = page;
    }

    async getFavIcon(): Promise<APIResponse> {
        const response = await this.page.request.get('/favicon.ico');

        return response;
    }

    async getLogo(): Promise<APIResponse> {
        const response = await this.page.request.get('/logo.png');

        return response;
    }

    async getDiscordSvg(): Promise<APIResponse> {
        const response = await this.page.request.get('/discord.svg');

        return response;
    }
}