const request = require('supertest');
const mongoose = require("mongoose");
const cookie = require('cookie');
const app = require('./../server');
const User = require('./../models/User');

describe("Authentication", () => {
    const agent = request.agent(app);

    const newUser = {
        firstname: "John",
        lastname: "Doe",
        email: "john@test.com",
        password: "superdifficultpassword",
        password2: "superdifficultpassword"
    };

    // before testing, let's create a new connection to the database (in memory)
    beforeAll(async () => {
        await mongoose.connect(
            process.env.MONGO_URL, 
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            }
        );
    });

    // after all tests finish, let's destroy the connection
    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    it('should create a new user', async () => {
        const response = await agent
            .post('/singup')
            .send(newUser);

        expect(response.status).toBe(201);
    });

    it('shouldn\'t allow to create a user with a duplicated email', async () => {        
        const response = await agent
            .post('/singup')
            .send(newUser);
            
        expect(response.status).toBe(409);
        expect(JSON.parse(response.text)).toEqual({ error: "email is already in use" });
    });

    it('should send a cookie when logging in', async () => {
        const credentials = {
            email: "john@test.com",
            password: "superdifficultpassword"
        };

        let authCookie;
        
        const response = await agent
            .post('/login')
            .send(credentials);
            
        expect(response.status).toBe(200);
        authCookie = cookie.parse(response.headers['set-cookie'][0]).auth;
        expect(authCookie).toBeDefined();
    });

    it('should deny access whith an invalid email', async () => {
        const credentials = {
            email: "chris@test.com",
            password: "superdifficultpassword"
        };
        
        const response = await agent
            .post('/login')
            .send(credentials);
            
        expect(response.status).toBe(401);
        expect(JSON.parse(response.text)).toEqual({ error: "invalid credentials" });
    });

    it('should deny access whith an invalid password', async () => {
        const credentials = {
            email: "john@test.com",
            password: "awrongpassword"
        };
        
        const response = await agent
            .post('/login')
            .send(credentials);
            
        expect(response.status).toBe(401);
        expect(JSON.parse(response.text)).toEqual({ error: "invalid credentials" });
    });
});