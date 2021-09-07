import { useAuth0 } from "@auth0/auth0-react";

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const useHttp = () => {
  const { getIdTokenClaims } = useAuth0();
  const baseUrl = process.env.REACT_APP_BASE_URL || "";

  const get = async <T>(url: string, body: any): Promise<T> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;
    const response = await fetch(`${baseUrl}${url}`, {
      method: "GET",
      headers: {
        ...headers,
        Authorization: authorization,
      }
    });
    return await response.json();
  };

  const post = async <T>(url: string, body: any): Promise<T> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;
    const response = await fetch(`${baseUrl}${url}`, {
      method: "POST",
      headers: {
        ...headers,
        Authorization: authorization,
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  };

  const put = async <T>(url: string, body: any): Promise<T> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;
    const response = await fetch(`${baseUrl}${url}`, {
      method: "PUT",
      headers: {
        ...headers,
        Authorization: authorization,
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  };

  const deleteRequest = async <T>(url: string, body: any): Promise<T> => {
    const { __raw } = await getIdTokenClaims();
    const authorization = `Bearer ${__raw}`;
    const response = await fetch(`${baseUrl}${url}`, {
      method: "DELETE",
      headers: {
        ...headers,
        Authorization: authorization,
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  };

  return { get, post, put, deleteRequest };
};
