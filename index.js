const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
app.use(cors());
app.use(express.json());

// Verify jwt token
const verifyJwt = (req, res, next) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        res.status(401).send({ message: "Unauthorize Access" });
    }
    const [email, token] = authHeaders?.split(" ");
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            res.status(403).send({ message: "Forbidden" });
        }
        if (decoded) {
            req.decoded = decoded;
            next();
        }
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5eweb39.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("ok")
        const allPostsCollection = client.db("atibhooj").collection("posts");
        const usersCollection = client.db("atibhooj").collection("users");
        const megazinesCollection = client.db("atibhooj").collection("megazines");
        const TopBannersCollection = client.db("atibhooj").collection("topBanners");

        // Access Token Generator
        app.post('/jwtTokenGenerator', (req, res) => {
            const user = req.body;
            if (user) {
                var token = jwt.sign({ email: user.emailToToken }, process.env.ACCESS_TOKEN, { expiresIn: '5h' });
                res.send({
                    success: true,
                    token
                });
            }
            else {
                res.send({
                    success: false
                });
            }
        })

        // Store user
        app.put("/users/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // Get User
        app.get('/user', async (req, res) => {
            const userEmail = req.query.email;
            const result = await usersCollection.find({ email: userEmail }).toArray();
            res.send(result);
        })

        // Get Users
        app.get('/users', verifyJwt, async (req, res) => {
            const result = await usersCollection.find({}).toArray();
            res.send(result);
        })

        // Update Cover Field
        app.put('/userCover/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const userCoverPic = req.body;
            const filter = { userEmail: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: userCoverPic,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Update Profile Field
        app.put('/userProfile/:email', async (req, res) => {
            const email = req.params.email;
            const userProfilePic = req.body;
            const filter = { userEmail: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: userProfilePic,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Update Bio 
        app.put('/userProfile/:email', async (req, res) => {
            const email = req.params.email;
            const userBio = req.body;
            const filter = { userEmail: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: userBio,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Update my Following 
        app.put('/myFollowing/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const following = req.body;
            const filter = { userEmail: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: following,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Update influencer 
        app.put('/myFollowers/:email', verifyJwt, async (req, res) => {
            const email = req.params.email;
            const followers = req.body;
            const filter = { userEmail: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: followers,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Get posts 
        app.get('/posts', async (req, res) => {
            const result = await allPostsCollection.find({}).sort({ $natural: -1 }).toArray();
            res.send(result);
        })

        // POST user post 
        app.post('/posts', verifyJwt, async (req, res) => {
            const postData = req.body;
            const result = await allPostsCollection.insertOne(postData)
            res.send(result);
        })

        // Get post
        app.get('/post', async (req, res) => {
            const userEmail = req.query.email;
            const result = await allPostsCollection.find({ userMail: userEmail }).toArray();
            res.send(result);
        })

        // Get post
        app.get('/post-details/:postId', async (req, res) => {
            const postId = req.params.postId;
            const query = { _id: new ObjectId(postId) }
            const result = await allPostsCollection.findOne(query);
            res.send(result);
        })

        // Liking Method
        app.put('/postLike/:postId', async (req, res) => {
            const postId = req.params.postId;
            const totalLike = req.body;
            const filter = { _id: new ObjectId(postId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: totalLike,
            };
            const result = await allPostsCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Comment Method
        app.put('/postComment/:postID', verifyJwt, async (req, res) => {
            const postId = req.params.postID;
            const updatedComment = req.body;
            // console.log(postId)
            // console.log(updatedComment)
            const filter = { _id: new ObjectId(postId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: updatedComment,
            };
            const result = await allPostsCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Upload Megazine
        app.post('/megazineUpload', verifyJwt, async (req, res) => {
            const megazineData = req.body;
            const result = await megazinesCollection.insertOne(megazineData);
            res.send(result);
        })

        // Get Megazine
        app.get('/megazines', async (req, res) => {
            const result = await megazinesCollection.find({}).toArray();
            res.send(result);
        })

        // Hanlde Megazine Quantity
        app.put('/megazinesquantity/:id', async (req, res) => {
            const megazineId = req.params.id;
            const newQuantity = req.body;
            const filter = { _id: new ObjectId(megazineId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: newQuantity,
            };
            const result = await megazinesCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Hanlde Team Atibhooj add members
        app.put('/atibhoojMemberHandle/:userId', verifyJwt, async (req, res) => {
            const userId = req.params.userId;
            const Treqest = req.body;
            const filter = { _id: new ObjectId(userId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: Treqest,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Hanlde Team Team Atibhooj badge Atibhooj
        app.put('/atibhoojBadgeHandle/:userId', verifyJwt, async (req, res) => {
            const userId = req.params.userId;
            const Treqest = req.body;
            const filter = { _id: new ObjectId(userId) };
            const options = { upsert: true };
            const updateDoc = {
                $set: Treqest,
            };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        })

        // Get atibhooj team members
        app.get('/teamMembers', async (req, res) => {
            const result = await usersCollection.find({ teamAtibhooj: true }).toArray();
            res.send(result);
        })

        // Get atibhooj mentors
        app.get('/atibhoojMentors', async (req, res) => {
            const result = await usersCollection.find({ atibhoojMentors: true }).toArray();
            res.send(result);
        })

        // Check Admin
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ userEmail: email });
            const isAdmin = user?.role === "admin";
            res.send({ admin: isAdmin });
        })

        // Top Banner Upload
        app.post('/uploadTopbanner', verifyJwt, async (req, res) => {
            const TopBanner = req.body;
            const result = await TopBannersCollection.insertOne(TopBanner)
            res.send(result);
        })

        // Get Top Banner 
        app.get('/allTopbanner', async (req, res) => {
            const result = await TopBannersCollection.find({}).toArray();
            res.send(result);
        })

        // Get ইসলামিক Posts
        app.get('/islamicPosts', async (req, res) => {
            const result = await allPostsCollection.find({ postCate: "ইসলামিক" }).toArray();
            res.send(result);
        })

        // Get গল্প Posts 
        app.get('/golpoPosts', async (req, res) => {
            const result = await allPostsCollection.find({ postCate: "গল্প" }).toArray();
            res.send(result);
        })

        // Get কবিতা Posts 
        app.get('/kobitaPosts', async (req, res) => {
            const result = await allPostsCollection.find({ postCate: "কবিতা" }).toArray();
            res.send(result);
        })

        // Get উপন্যাস Posts 
        app.get('/upannasPosts', async (req, res) => {
            const result = await allPostsCollection.find({ postCate: "উপন্যাস" }).toArray();
            res.send(result);
        })

        // Get জোক Posts 
        app.get('/jokesPosts', async (req, res) => {
            const result = await allPostsCollection.find({ postCate: "জোক" }).toArray();
            res.send(result);
        })

    }
    finally {
        // await client.close()
    }
}

// Call the main function
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello from Atibhoj Server!");
});

app.listen(port, () => {
    console.log(`Atibhooj server is running on port ${port}`);
});