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
  it("should fail GET /user/register", async () => {
    const response = await request(app).get("/user/register");
    expect(response.status).toBe(404);
  });  

  /* 
    * Test "/auth/register" POST route
    * Expected to pass because the route is defined
    * */
  it("should successfully POST /user/register", async () => {
    const response = await request(app).post("/user/register").send(userDataFields);
    expect(response.status).toBe(201);
    // it only receives access token and refresh token
    expect(response.body).toEqual({ accessToken: expect.any(String), refreshToken: expect.any(String) });
  });

    /*
      * Test with same email "/auth/register" POST route
      * Expected to fail because the same email is already in the database
      * */
    it("should fail POST /user/register with same email", async () => {
      const response = await request(app).post("/user/register").send(userDataFields);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "User with this email already exists." });
  });
});

// Test User routes
describe("Login User routes", () => {

    it("should fail POST /user/login with wrong password", async () => {
      const email = userDataFields.email;
        const response = await request(app).post("/user/login").send({ email, password: "wrongpassword" });
        expect(response.status).toBe(400);

        expect(response.body).toEqual({ message: "Invalid email or password." });
    }
    );

    it("should successfully POST /user/login", async () => {

        const response = await request(app).post("/user/login").send(loginData);

        // fetch the token from httpOnly cookie using cookie-parser
        const cookies = cookie.parse(response.headers["set-cookie"][0]);
        token = cookies.token;

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Logged in successfully.", accessToken: expect.any(String) });
        // test the accessToken  in body 
        

    } );

    //try to register after logging in to see if it fails
    it("should fail POST /user/register after logging in", async () => {

      // login to get the token 
      const loginResponse = await request(app).post("/user/login").send(loginData);
      const cookies = cookie.parse(loginResponse.headers["set-cookie"][0]);
      token = cookies.token;

      // Attempt to register with the new user data
      const response = await request(app)
          .post("/user/register")
          .set("Cookie", `token=${token}`)
          .send({
              name: "John Doe",
              email: "teheheh@gmail.com",
              password: "password",
              confirmPassword: "password",
          });
      // console.log(response.body);
      expect(response.status).toBe(409);
      expect(response.body).toEqual({ message: "Already authenticated" });
    }
    );

});

describe("Logout_routes", () => {

  it("should successfully POST /user/login", async () => {

    const response = await request(app).post("/user/login").send(loginData);

    // fetch the token from httpOnly cookie using cookie-parser
    const cookies = cookie.parse(response.headers["set-cookie"][0]);
    token = cookies.token;

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Logged in successfully.", accessToken: expect.any(String) });
  } );
  
    it("should successfully POST /user/logout", async () => {
      const response = await request(app).post("/user/logout").set("Cookie", `token=${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Logged out successfully." });
    });
  });





describe("Other routes", () => {
  //   // Test "/user" GET route
  it("GET /profile should return logged in user", async () => {
    // login to get the token
    const loginResponse = await request(app).post("/user/login").send(loginData);
    const cookies = cookie.parse(loginResponse.headers["set-cookie"][0]);
    token = cookies.token;

    const response = await request(app).get("/user").set("Cookie", `token=${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ 
      user: expect.objectContaining({ 
        IsAdmin: false,
        createdAt: expect.any(String),
        email: loginData.email,
        name: userDataFields.name,
      }),
     }));
  });

//   // Test "/user/:id" GET route
//   it("should return a single user", async () => {
//     const response = await request(app).get(`/user/${userDataFields.email}`);
//     expect(response.status).toBe(200);
//     expect(response.body).toEqual(userDataFields);
//   });

//   // Test "/user" POST route
//   it("should create a new user", async () => {
//     const newUser = {
//       name: "John Doe",
//       email: "test1@exmaple.com",
//         password: "password",
//     };
//     const response = await request(app).post("/user").send(newUser);
//     expect(response.status).toBe(201);
//     expect(response.body).toEqual({ ...newUser, id: expect.any(Number) });
//     }
//     );
});