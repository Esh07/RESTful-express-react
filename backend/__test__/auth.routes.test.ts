import { PrismaMockClient } from "./@prisma/client";

import { userData } from "../src/lib/seed";
import request from "supertest";
import { describe, expect, beforeAll, it, afterEach, beforeEach, afterAll } from "@jest/globals";
import { app } from "../src/app/index";
import { execSync } from "child_process";

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


// Test "/" GET route
describe("GET /", () => {

  it("should return a welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Hello World!" });
  });
});

// Test User routes
describe("User routes", () => {
  let prisma: InstanceType<typeof PrismaMockClient>;

  beforeEach(async () => {
    prisma = new PrismaMockClient();
    
    // await prisma.user.create({ data: userDataFields });
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

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

    it("should successfully POST /auth/login", async () => {
      console.log(loginData);
        const response = await request(app).post("/auth/login").send(loginData);

        console.log(response.body);
        expect(response.status).toBe(200);
    } );

    it("should fail POST /auth/login with wrong password", async () => {
      const email = userDataFields.email;
        const response = await request(app).post("/auth/login").send({ email, password: "wrongpassword" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid email or password." });
    }
    );
});


afterAll(async () => {
    // drop the database
    execSync("npx prisma migrate reset --force", { stdio: "inherit" });


}
);
