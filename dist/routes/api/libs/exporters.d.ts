import Router from 'koa-router';
import { tConfigExporter } from '../../../libs/exporters';
export declare type tApiExport = tConfigExporter & {
    name: string;
    router: Router;
    route: string;
    init: () => Promise<void>;
};
