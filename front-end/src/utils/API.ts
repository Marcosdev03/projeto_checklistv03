import axios, { type AxiosInstance } from "axios";
import Cookies from "js-cookie";

// Definição dos endpoints da API
export const ENDPOINT = {
    BACKEND_ADDRESS: 'http://localhost:8000/api',

    AUTH_REGISTER_CODE_SEND: '/authentication/register/send-code',
    AUTH_REGISTER_CODE_VERIFY: '/authentication/register/verify-code',
    AUTH_REGISTER: '/authentication/register/complete',
    AUTH_LOGIN: '/authentication/login',

    CHANGE_USERNAME: '/authentication/username/me',

    AUTH_RECOVER: '/authentication/forgot-password',
    AUTH_RECOVER_COMFIRM: '/authentication/verify-code',
    AUTH_SWITCH_PASSWORD: '/authentication/reset-password',

    TASK_CRUD: '/tasks',
    DASHBOARD: '/tasks/dashboard',
}

// Classe estática para manipulação de cookies
export class Coockie {
    public static getAccess = () => Cookies.get("access");
    public static getRefresh = () => Cookies.get("refresh");

    public static setAccess = (refresh: string) => Cookies.set("access", refresh);
    public static setRefresh = (access: string) => Cookies.set("refresh", access);

    public static removeAccess = () => Cookies.remove("access");
    public static removeRefresh = () => Cookies.remove("refresh");

    public static setHeaderAuthorization = (route: AxiosInstance) => {
        if (Coockie.getRefresh() && Coockie.getAccess()) {
            route.defaults.headers.common["Authorization"] = `Bearer ${Coockie.getAccess()}`;
        }
    }
}

// Classe para manipulação de requisições API utilizando o Axios.
// Ela coloca o token de autenticação em cada requisição, automaticamente.
class API {
    private address = `${ENDPOINT.BACKEND_ADDRESS}`;
    private route = axios.create({ baseURL: `${this.address}` });

    public GET = async (path: string) => {
        Coockie.setHeaderAuthorization(this.route);
        const res = await this.route.get(path);
        return { data: res.data, status: res.status };
    };

    public POST = async (path: string, data: object) => {
        Coockie.setHeaderAuthorization(this.route);
        const res = await this.route.post(path, data);
        return { data: res.data, status: res.status };
    };

    public PUT = async (path: string, data: object) => {
        Coockie.setHeaderAuthorization(this.route);
        const res = await this.route.put(path, data);
        return { data: res.data, status: res.status };
    };

    public PATCH = async (path: string, data: object) => {
        Coockie.setHeaderAuthorization(this.route);
        const res = await this.route.patch(path, data);
        return { data: res.data, status: res.status };
    };

    public DELETE = async (path: string) => {
        Coockie.setHeaderAuthorization(this.route);
        const res = await this.route.delete(path);
        return { data: res.data, status: res.status };
    };
}

export default new API();