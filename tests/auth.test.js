const request = require('supertest');
const mongoose = require("mongoose");
const cookie = require('cookie');
const app = require('./../server');
const User = require('./../models/User');

describe("Authentication", () => {
    const agent = request.agent(app);
    let cookie;
    
    // before testing, let's create a new connection to the database (in memory)
    beforeAll(async () => {
        await mongoose.connect(
            process.env.MONGO_URL, 
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
    });

    // after all tests finish, let's destroy the connection
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // before each test, let's empty the database
    beforeEach(async () => {
        await User.deleteMany();
    });

    it('should create a new user', async () => {
        const newUser = {
            firstname: "John",
            lastname: "Doe",
            email: "john@test.com",
            password: "superdifficultpassword",
            password2: "superdifficultpassword"
        };

        const response = await agent
            .post('/singup')
            .send(newUser);

        expect(response.status).toBe(201);
    });

    it('shouldn\'t allow to create a user with a duplicated email', async () => {
        const newUser = {
            firstname: "John",
            lastname: "Doe",
            email: "john@test.com",
            password: "superdifficultpassword",
            password2: "superdifficultpassword"
        };

        await agent
            .post('/singup')
            .send(newUser);
        
        const response = await agent
            .post('/singup')
            .send(newUser);
            
        expect(response.status).toBe(409);
        expect(JSON.parse(response.text)).toEqual({ error: "email is already in use" });
    });

    it('should save a cookie when logging in', async () => {
        const newUser = {
            firstname: "John",
            lastname: "Doe",
            email: "john@test.com",
            password: "superdifficultpassword",
            password2: "superdifficultpassword"
        };

        const credentials = {
            email: "john@test.com",
            password: "superdifficultpassword"
        };

        await agent
            .post('/singup')
            .send(newUser);
        
        const response = await agent
            .post('/login')
            .send(credentials);
            
        expect(response.status).toBe(200);
        console.log(cookie.parse(response.headers['set-cookie'][0]));
        expect(response.cookies.auth).toBeDefined();
    });
});