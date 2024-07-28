import { PrismaMockClient } from "./@prisma/client";

import { userData } from "../src/lib/seed";
import request from "supertest";
import { describe, expect, beforeAll, it, afterEach, beforeEach, afterAll } from "@jest/globals";
import { app } from "../src/app/index";
import { execSync } from "child_process";
import cookie from "cookie";


process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";


const userDataFields = {
    name: "Jane Doe",
    email: "test1@example.com",
    password: "password",
    confirmPassword: "password",
};

const loginData = {
    email: "test1@example.com",
    password: "password",
};

let token: string;

let prisma: InstanceType<typeof PrismaMockClient>;

// initialize the prisma ./test.db database and migrate the schema (sqlite)
beforeAll(async () => {

    // connect to the database
    const prisma = new PrismaMockClient();
    // create the schema
    await prisma.$connect();
    // migrate the schema
    execSync("npx prisma migrate dev --preview-feature", { stdio: "inherit" });
    // generate the prisma client
    execSync("npx prisma generate", { stdio: "inherit" });
    // execSync("npx prisma db push", { stdio: "inherit" });
    // disconnect the database
    
})

afterAll(async () => {
    // drop the database
    execSync("npx prisma migrate reset --force", { stdio: "inherit" });
    // disconnect the database
    if (prisma) {
        await prisma.$disconnect();
    }
} );

// Test "/" GET route
describe("GET /", () => {

  it("should return a welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World!" });
  });
});


describe("Auth Register User routes", () => {

   /*
  * Test "/auth/Register" POST route
  * Expected to fail because the route is not defined
  * */
  it("should fail GET /auth/register", async () => {
    const response = await request(app).get("/auth/register");
    expect(response.status).toBe(404);
  });  

  /* 
    * Test "/auth/register" POST route
    * Expected to pass because the route is defined
    * */
  it("should successfully POST /auth/register", async () => {
    const response = await request(app).post("/auth/register").send(userDataFields);
    expect(response.status).toBe(201);
    // it only receives access token and refresh token
    expect(response.body).toEqual({ accessToken: expect.any(String), refreshToken: expect.any(String) });
  });

    /*
      * Test with same email "/auth/register" POST route
      * Expected to fail because the same email is already in the database
      * */
    it("should fail POST /auth/register with same email", async () => {
      const response = await request(app).post("/auth/register").send(userDataFields);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User with this email already exists." });
  });
});

// Test User routes
describe("Login User routes", () => {

    it("should fail POST /auth/login with wrong password", async () => {
      const email = userDataFields.email;
        const response = await request(app).post("/auth/login").send({ email, password: "wrongpassword" });
        expect(response.status).toBe(400);

        expect(response.body).toEqual({ message: "Invalid email or password." });
    }
    );

    it("should successfully POST /auth/login", async () => {
      console.log(loginData);
        const response = await request(app).post("/auth/login").send(loginData);
        console.log(response.headers);
        // fetch the token from httpOnly cookie using cookie-parser
        const cookies = cookie.parse(response.headers["set-cookie"][0]);
        token = cookies.token;
        console.log(token);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Logged in successfully." });
    } );

});
