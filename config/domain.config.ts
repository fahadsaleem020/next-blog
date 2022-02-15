const enviroment = process.env.NODE_ENV === "development";
export const url = enviroment ? "http://localhost:3000" : "https://newsapp.tk";
