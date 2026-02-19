import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Definição dos endpoints da API
export const ENDPOINT = {
    BACKEND_ADDRESS: '/api',

    AUTH_REGISTER_CODE_SEND: '/authentication/register/send-code',
    AUTH_REGISTER_CODE_VERIFY: '/authentication/register/verify-code',
    AUTH_REGISTER: '/authentication/register/complete',
    AUTH_LOGIN: '/authentication/login',
    AUTH_TOKEN_REFRESH: '/authentication/token/refresh',

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

    public static setAccess = (token: string) => Cookies.set("access", token);
    public static setRefresh = (token: string) => Cookies.set("refresh", token);

    public static removeAccess = () => Cookies.remove("access");
    public static removeRefresh = () => Cookies.remove("refresh");

    public static clearAll = () => {
        Coockie.removeAccess();
        Coockie.removeRefresh();
    }

    public static setHeaderAuthorization = (route: AxiosInstance) => {
        const access = Coockie.getAccess();
        if (access) {
            route.defaults.headers.common["Authorization"] = `Bearer ${access}`;
        } else {
            delete route.defaults.headers.common["Authorization"];
        }
    }
}

// Classe para manipulação de requisições API utilizando o Axios.
// Interceptor automático renova o access token via refresh token ao receber 401.
class API {
    private address = `${ENDPOINT.BACKEND_ADDRESS}`;
    private route = axios.create({ baseURL: `${this.address}` });
    private isRefreshing = false;

    constructor() {
        this.route.interceptors.response.use(
            (response) => response,
            async (error) => {
                const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                const is401 = error.response?.status === 401;
                const alreadyRetried = original._retry;
                const isRefreshRoute = original.url?.includes("token/refresh");

                if (is401 && !alreadyRetried && !isRefreshRoute && !this.isRefreshing) {
                    original._retry = true;
                    this.isRefreshing = true;

                    const refresh = Coockie.getRefresh();

                    if (refresh) {
                        try {
                            const res = await axios.post(
                                `${this.address}${ENDPOINT.AUTH_TOKEN_REFRESH}`,
                                { refresh }
                            );
                            const newAccess: string = res.data.access;
                            Coockie.setAccess(newAccess);
                            this.route.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
                            original.headers["Authorization"] = `Bearer ${newAccess}`;
                            this.isRefreshing = false;
                            return this.route(original);
                        } catch {
                            // Refresh falhou — limpa sessão e remove header para desbloquear rotas públicas
                            Coockie.clearAll();
                            delete this.route.defaults.headers.common["Authorization"];
                            this.isRefreshing = false;
                        }
                    } else {
                        Coockie.clearAll();
                        delete this.route.defaults.headers.common["Authorization"];
                        this.isRefreshing = false;
                    }

                    // Retry sem token (permite rotas AllowAny funcionarem)
                    delete original.headers["Authorization"];
                    return this.route(original);
                }

                return Promise.reject(error);
            }
        );
    }

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
