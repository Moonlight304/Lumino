const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const fs = require('fs');

// For generating fake user data

fs.writeFileSync('./fakeUserData.txt', '');

const TOTAL_USER_COUNT = 30;
const TOTAL_POST_COUNT = 100;

const display_names = [
    'ShadowWolf', 'PixelNinja', 'CrimsonViper', 'TacticalTuna', 'SneakyPanda',
    'NovaStrike', 'HeadshotQueen', 'SilentBlade', 'GameOverlord', 'CyberSamurai',
    'RogueWizard', 'GamerXtreme', 'DarkHunter', 'KnightFury', 'NoobMaster69',
    'PhantomGhost', 'RapidFire', 'NeonNexus', 'SnipeShot', 'ToxicTank',
    'ArcadeJunkie', 'LagDestroyer', 'EliteSniper', 'QuantumHex', 'BattleBot',
    'MysticRogue', 'ChillGamer', 'BoomHeadshot', 'DeadlyCombo', 'VictoryVibe',
    'TurboDrift', 'ZeroLagLord', 'RocketManiac', 'SniperDoge', 'RageQuitter',
    'IceFang', 'CaptainClutch', 'BugHunter', 'Overdrive', 'TheStrategist',
    'MetaPlayer', 'PulseGunner', 'SpeedsterZ', 'UltraInstinct', 'TrollKing',
    'LootGoblin', 'WraithStorm', 'RampageKid', 'AceOfGames', 'SoloSlayer'
];

const bios = [
    'Just here to frag.', 'Casual gamer and chill vibes.', 'I play to win.',
    'Support main, team player.', 'Competitive FPS junkie.', 'Streaming on weekends!',
    'Strategy games are my jam.', 'Lover of old school RPGs.', 'Headshots only.',
    'Grinding ranked mode.', 'Add me on Steam!', 'Looking for teammates.',
    'DM me for co-op.', 'Gaming is life.', 'Eats noobs for breakfast.',
    'Victory is a habit.', 'Night owl gamer.', 'Chill but competitive.',
    'Here to have fun.', 'Glitch finder since 2010.', 'Achievement hunter.',
    'Top 0.1% ranked.', 'Retro gamer inside.', 'Let\'s squad up.',
    'Gaming since PS2 days.', 'Follow me on Twitch.', 'Raging quietly.',
    'My GPU is hotter than the sun.', 'Let\'s go full send!', 'Can\'t aim, still win.',
    'PC master race.', 'Console loyalist.', 'Android gamer, don\'t judge.',
    'Nades > Guns.', 'My ping is god-tier.', 'Teamwork is key.',
    'Solo carry always.', 'Low rank, high IQ.', 'Streamer in the making.',
    'Training every day.', 'No mic, still friendly.', 'Toxic-free zone.',
    'Only plays at 3AM.', 'Pro at being average.', 'VR is the future.',
    'Still grinding that battle pass.', 'Keyboard warrior.', 'Tryhard 24/7.',
    'Gaming over dating.', 'Legend in the lobby.'
];

// Expanded data arrays
const countries = [
    'India', 'United States', 'Germany', 'Japan', 'United Kingdom', 'Brazil', 'Canada', 'Australia',
    'France', 'South Korea', 'Mexico', 'Russia', 'Italy', 'Spain', 'Netherlands',
    'Sweden', 'Norway', 'Poland', 'Turkey', 'Argentina', 'Chile', 'Thailand',
    'Philippines', 'Indonesia', 'Malaysia', 'Singapore', 'New Zealand', 'Belgium',
    'Switzerland', 'Denmark', 'Finland', 'Portugal', 'Austria', 'Czech Republic',
    'Hungary', 'Greece', 'Ireland', 'Israel', 'UAE', 'Saudi Arabia'
];

const favouriteGames = [
    'Valorant', 'Minecraft', 'Counter Strike 2', 'FIFA', 'Call of Duty', 'Apex Legends',
    'Fortnite', 'League of Legends', 'Dota 2', 'Overwatch 2', 'Rocket League',
    'Among Us', 'Fall Guys', 'PUBG', 'Genshin Impact', 'Destiny 2',
    'Rainbow Six Siege', 'Warframe', 'Final Fantasy XIV',
    'Cyberpunk 2077', 'The Witcher 3', 'Grand Theft Auto V', 'Red Dead Redemption 2',
    'Elden Ring', 'Dark Souls 3', 'Sekiro', 'Bloodborne', 'Monster Hunter World',
    'Stardew Valley', 'Terraria', 'Hollow Knight', 'Celeste', 'Hades',
    'Dead by Daylight', 'Phasmophobia', 'Rust', 'Valheim', 'Subnautica',
    'The Forest', 'Green Hell', 'Satisfactory', 'Factorio', 'Cities Skylines',
    'Civilization VI', 'Age of Empires 4', 'Total War', 'Crusader Kings 3',
    'Europa Universalis IV', 'Hearts of Iron IV', 'Stellaris', 'Rimworld'
];

const favouriteGenres = [
    'FPS', 'RPG', 'Casual', 'Simulation', 'Strategy', 'MOBA', 'Battle Royale',
    'MMO', 'Racing', 'Sports', 'Fighting', 'Platformer', 'Puzzle', 'Horror',
    'Survival', 'Sandbox', 'Action', 'Adventure', 'Stealth', 'Roguelike',
    'Metroidvania', 'Tower Defense', 'City Builder', 'Management', 'Rhythm',
    'Visual Novel', 'Card Game', 'Board Game', 'Arcade', 'Indie'
];

// Post content templates with specific matching images
const postTemplates = [
    {
        type: "gameplay_achievement",
        posts: [
            { body: "Just pulled off an insane clutch in {game}! My heart is still racing 💓", image: "clutch" },
            { body: "Finally reached {rank} in {game}! The grind was real but so worth it 🎯", image: "rank" },
            { body: "Anyone else addicted to {game} right now? Can't stop playing!", image: "gameplay" },
            { body: "Epic {game} session last night with the squad. We dominated! 🔥", image: "victory" },
            { body: "New {game} update is amazing! Loving the new features", image: "update" },
            { body: "Teaching my little brother how to play {game}. He's getting good! 👨‍🏫", image: "teaching" },
            { body: "That moment when you carry the entire team in {game} 💪", image: "carry" },
            { body: "Found this amazing easter egg in {game}! Did you guys know about this?", image: "easter-egg" },
            { body: "RIP to my {game} character. Died doing what they loved - being reckless 😅", image: "death" },
            { body: "Building the most epic base in {game}! Check out these screenshots 🏗️", image: "base" }
        ]
    },
    {
        type: "esports_discussion",
        posts: [
            { body: "Just watched the {game} championship finals. What an insane match! 🏆", image: "tournament" },
            { body: "Predictions for the upcoming {game} tournament? My money's on {team}", image: "prediction" },
            { body: "That play in the {game} finals was absolutely legendary! 🔥", image: "legendary-play" },
            { body: "Watching pros play {game} makes me realize how much I need to improve", image: "pro-play" },
            { body: "The meta in {game} is shifting so fast. Adapting is key to staying competitive", image: "meta" }
        ]
    },
    {
        type: "looking_for_group",
        posts: [
            { body: "Anyone up for some {game} tonight? Looking for chill teammates 😊", image: "lfg" },
            { body: "LFG for {game} ranked. I'm currently {rank}, looking to climb!", image: "ranked" },
            { body: "Starting a {game} clan! DM me if you're interested in joining 🎮", image: "clan" },
            { body: "Looking for people to play {game} with. Preferably with mics! 🎤", image: "mic" },
            { body: "Who's online right now? Let's queue up for some {game}!", image: "queue" },
            { body: "Need one more for our {game} squad. Must be good at {role}!", image: "squad" },
            { body: "Creating a Discord server for {game} players. Link in bio! 💬", image: "discord" }
        ]
    },
    {
        type: "streaming_content",
        posts: [
            { body: "Streaming {game} tonight at 8PM! Come hang out and watch me fail 😂", image: "stream-setup" },
            { body: "Going live with some {game} gameplay. Link in bio! 📺", image: "going-live" },
            { body: "Stream highlight from yesterday's {game} session. This was nuts!", image: "highlight" },
            { body: "Taking a break from streaming to actually get good at {game} 😅", image: "practice" }
        ]
    },
    {
        type: "game_appreciation",
        posts: [
            { body: "Beautiful sunset in {game}. Sometimes you gotta stop and appreciate the art 🌅", image: "sunset" },
            { body: "The sound design in {game} is absolutely incredible. Wearing headphones is a must!", image: "headphones" },
            { body: "This {game} soundtrack hits different. Gaming music is so underrated 🎵", image: "soundtrack" },
            { body: "The attention to detail in {game} is mind-blowing. Every pixel is perfect", image: "details" },
            { body: "Found this hidden area in {game}. The developers really went all out! 🗺️", image: "hidden-area" },
            { body: "Photo mode in {game} is dangerous. I spend more time taking screenshots than playing!", image: "photo-mode" }
        ]
    },
    {
        type: "game_news",
        posts: [
            { body: "{game} devs just announced a new expansion! Hyped for what's coming 🔥", image: "announcement" },
            { body: "{game} servers going down for maintenance tonight. Hope they fix the bugs 🛠️", image: "maintenance" },
            { body: "{game} just dropped a surprise patch. Anyone tried it yet?", image: "patch" },
            { body: "{game} might be getting a crossover event soon 👀 Rumors are flying!", image: "crossover" },
            { body: "Beta access for {game}'s new season is live. Who else got in?", image: "beta" }
        ]
    },
    {
        type: "game_memes",
        posts: [
            { body: "Me after dying to the same boss in {game} for the 20th time 😭", image: "rage" },
            { body: "When {game} matchmaking pairs you with actual bots 🧠➡️🪫", image: "matchmaking" },
            { body: "Friend: 'Let\'s just play one game of {game}.' 3 hours later...", image: "addiction" },
            { body: "{game} logic: Fall from 3 feet? Dead. Get shot 12 times? Still alive 💀", image: "logic" },
            { body: "Stealth mission in {game}: *accidentally sneezes* Enemies: 👁️👁️", image: "stealth" }
        ]
    }

];


// Text-only post templates (no image)
const textOnlyTemplates = [
    "Hot take: {game} is overrated. Change my mind 🤔",
    "Unpopular opinion: Single player games > Multiplayer games",
    "What's your most controversial gaming opinion? I'll start... 💭",
    "Gaming quote of the day: 'It's not about the K/D ratio, it's about having fun'",
    "Remember when games came with actual manuals? Good times 📚",
    "Favorite gaming memory? Mine is beating {game} for the first time 🏆",
    "Gaming confessions: I still play on easy mode sometimes 😅",
    "Which gaming era was the best? 90s, 2000s, 2010s, or now? 🕰️",
    "PSA: Don't forget to drink water while gaming! Stay hydrated gamers 💧",
    "Just realized I've been gaming for {years} years. Time flies! ⏰",
    "Gaming community question: What's the most toxic game you've played? 🤢",
    "Shower thought: Why do we call it 'grinding' when we actually enjoy it? 🚿",
    "Gaming life hack: Always check your settings before blaming lag 🔧",
    "Motivational Monday: You miss 100% of the shots you don't take 🎯",
    "Gaming wisdom: The best equipment can't replace good teamwork 🤝",
    "Wholesome gaming moment: Made a new friend in matchmaking today 😊",
    "Gaming pet peeve: People who don't use their mics in team games 🙄",
    "Retro gaming question: What's your favorite game from the 2000s? 👾",
    "Gaming goals for this month: Reach {rank} and have fun doing it! 📈",
    "Friendly reminder: It's okay to take breaks from competitive gaming 🧘"
];

const moreItems = [
    'keyboard', 'mouse', 'headset', 'monitor', 'graphics card', 'gaming chair',
    'microphone', 'webcam', 'mousepad', 'desk lamp', 'VR headset', 'controller'
];
const moreTeams = [
    'Team Liquid', 'FaZe Clan', 'G2 Esports', 'Fnatic', 'Cloud9', 'TSM',
    'NAVI', 'OG', 'Evil Geniuses', 'Astralis', '100 Thieves', 'Vitality'
];
const moreRoles = [
    'support', 'carry', 'tank', 'healer', 'DPS', 'initiator', 'sniper', 'leader', 'strategist'
];

const axios = require('axios');

// Configure your IGDB API credentials
const IGDB_CONFIG = {
    clientId: process.env.TWITCH_CLIENT_ID,
    accessToken: process.env.IGDB_ACCESS_TOKEN,
    baseUrl: 'https://api.igdb.com/v4'
};

router.get('/test', async (req, res) => {
    try {
        const gameName = "Valorant";

        // Step 1: Get game ID from the /games endpoint
        const gameSearchResponse = await axios.post(
            `${IGDB_CONFIG.baseUrl}/games`,
            `search "${gameName}"; fields id; limit 1;`,
            {
                headers: {
                    'Client-ID': IGDB_CONFIG.clientId,
                    'Authorization': `Bearer ${IGDB_CONFIG.accessToken}`
                }
            }
        );

        const gameId = gameSearchResponse.data[0]?.id;
        if (!gameId) return res.status(404).send("Game not found");

        // Step 2: Get screenshots for that game ID
        const screenShotResponse = await axios.post(
            `${IGDB_CONFIG.baseUrl}/screenshots`,
            `fields image_id; where game = ${gameId};`,
            {
                headers: {
                    'Client-ID': IGDB_CONFIG.clientId,
                    'Authorization': `Bearer ${IGDB_CONFIG.accessToken}`
                }
            }
        );
        const screenShotData = screenShotResponse.data;

        const randomIndex = Math.floor(Math.random() * screenShotData.length)
        const randomScreenshotID = screenShotData[randomIndex].image_id

        const imageUrl = `https://images.igdb.com/igdb/image/upload/t_original/${randomScreenshotID}.jpg`;

        console.log(randomIndex);
        console.log(imageUrl);

        res.json(screenShotResponse.data);

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send("Something went wrong");
    }
});

// Cache to store game ID to image mappings
const gameImageCache = new Map();

/**
 * Fetches game cover art from IGDB
 * @param {string} gameName - Name of the game to search for
 * @param {string} postType - Type of post (for fallback selection)
 * @returns {Promise<string>} Image URL
 */
async function fetchGameImage(gameName, postType) {
    try {
        // Check cache first
        if (gameImageCache.has(gameName)) {
            return gameImageCache.get(gameName);
        }

        // Step 1: Search for the game ID
        const searchResponse = await axios.post(
            `${IGDB_CONFIG.baseUrl}/games`,
            `search "${gameName}"; fields id; limit 1;`,
            {
                headers: {
                    'Client-ID': IGDB_CONFIG.clientId,
                    'Authorization': `Bearer ${IGDB_CONFIG.accessToken}`
                }
            }
        );

        const gameId = searchResponse.data?.[0]?.id;
        if (!gameId) throw new Error('Game not found');

        // Step 2: Get screenshots and prefer horizontal (FPP-friendly)
        const screenShotResponse = await axios.post(
            `${IGDB_CONFIG.baseUrl}/screenshots`,
            `fields image_id, width, height; where game = ${gameId}; limit 10;`,
            {
                headers: {
                    'Client-ID': IGDB_CONFIG.clientId,
                    'Authorization': `Bearer ${IGDB_CONFIG.accessToken}`
                }
            }
        );

        let imageUrl = null;

        if (screenShotResponse.data?.length) {
            // Filter for good-quality landscape screenshots
            const screenShotData = screenShotResponse.data.filter(
                ss => ss.width >= 1280 && ss.height >= 720 && ss.width > ss.height
            );

            let selectedScreenshot;

            if (screenShotData.length > 0) {
                // Pick a random high-quality landscape screenshot
                const randomIndex = Math.floor(Math.random() * screenShotData.length);
                selectedScreenshot = screenShotData[randomIndex];
            } else {
                // Fallback: prefer wide image, else use first available
                selectedScreenshot = screenShotResponse.data.find(ss => ss.width > ss.height) || screenShotResponse.data[0];
            }

            if (selectedScreenshot?.image_id) {
                const imageUrl = `https://images.igdb.com/igdb/image/upload/t_original/${selectedScreenshot.image_id}.jpg`;
                gameImageCache.set(gameName, imageUrl);
                return imageUrl;
            }
        }


        // Step 3: Try getting cover image if no screenshots
        const coverResponse = await axios.post(
            `${IGDB_CONFIG.baseUrl}/covers`,
            `fields image_id; where game = ${gameId}; limit 1;`,
            {
                headers: {
                    'Client-ID': IGDB_CONFIG.clientId,
                    'Authorization': `Bearer ${IGDB_CONFIG.accessToken}`
                }
            }
        );

        if (coverResponse.data?.length) {
            imageUrl = `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverResponse.data[0].image_id}.jpg`;

            gameImageCache.set(gameName, imageUrl);
            return imageUrl;
        }

        throw new Error('No images found');

    } catch (error) {
        console.warn(`IGDB fetch failed for ${gameName}: ${error.message}`);
        return getFallbackImage(postType);
    }
}

/**
 * Provides relevant fallback images based on post type
 */
function getFallbackImage(postType) {
    const fallbackImages = {
        gameplay_achievement: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
        setup_showcase: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620',
        esports_discussion: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f',
        // ... add more mappings
    };

    return fallbackImages[postType] || 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8';
}

// Utility to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Utility to pick a random element
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

router.get('/generate-mock-data', async (req, res) => {
    try {
        const users = [];

        for (let i = 0; i < TOTAL_USER_COUNT; i++) {
            console.log(`User : ${i}`);
            const email = `user${i + 1}@mockmail.com`;
            const password = `Pass@${i + 1}`;
            const display_name = display_names[i];
            const bio = bios[i];
            const discord_username = `${display_name}#${1000 + i}`;
            const steam_id = `STEAM_${100000 + i}`;

            fs.appendFileSync('./fakeUserData.txt', `${display_name} -- ${email} : ${password}\n`);

            const passwordHash = await bcrypt.hash(password, 10);

            // Get random favorites with more variety
            const userFavGames = favouriteGames
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 5) + 1);

            const userFavGenres = favouriteGenres
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * 4) + 1);

            users.push(new User({
                display_name,
                bio,
                email,
                passwordHash,
                country: countries[i % countries.length],
                profile_picture: `https://api.dicebear.com/6.x/thumbs/svg?seed=${display_name}`,
                age: 18 + (i % 15),
                gender: ['Male', 'Female', 'dont-specify'][i % 3],
                favourite_games: userFavGames,
                favourite_genres: userFavGenres,
                platform: ['PC', 'PlayStation', 'Xbox', 'Android', 'IOS', 'Any'][i % 6],
                playstyle: ['Casual', 'Competitive', 'Mixed', 'Any'][i % 4],
                communication_preference: ['Voice', 'Text', 'Both', 'Any'][i % 4],
                discord_username,
                steam_id
            }));
        }

        const createdUsers = await User.insertMany(users);
        const userIDs = createdUsers.map(u => u._id);

        // Add connections
        for (const user of createdUsers) {
            const others = userIDs.filter(id => !id.equals(user._id));
            user.connectedIDs = others.slice(0, Math.floor(Math.random() * 8) + 3); // 3-10 connections
            user.sentIDs = others.slice(10, 10 + Math.floor(Math.random() * 5)); // 0-4 sent requests
            user.receivedIDs = others.slice(15, 15 + Math.floor(Math.random() * 5)); // 0-4 received requests
        }
        await Promise.all(createdUsers.map(u => u.save()));

        // Enhanced Posts
        const posts = [];
        // To reduce duplicates, shuffle template categories and posts
        let shuffledTemplates = shuffleArray([...postTemplates]);
        let templateIndex = 0;
        let postIndices = shuffledTemplates.map(cat => 0);

        for (let i = 0; i < TOTAL_POST_COUNT; i++) { // Increased to 200 posts for more data
            console.log(`Post : ${i}`);

            const author = createdUsers[i % createdUsers.length];
            const shouldHaveImage = Math.random() > 0.25; // 75% chance of image

            let postBody, imageURL = null;
            let templateCategory, selectedPost, subjectValue, imageSubjectType;

            if (shouldHaveImage) {
                templateCategory = pick(postTemplates);
                selectedPost = pick(templateCategory.posts);

                // Detect which placeholder is present and set subject accordingly
                if (selectedPost.body.includes('{game}')) {
                    subjectValue = pick(author.favourite_games.length ? author.favourite_games : favouriteGames);
                    imageSubjectType = 'game';
                } else if (selectedPost.body.includes('{item}')) {
                    subjectValue = pick(moreItems);
                    imageSubjectType = 'item';
                } else if (selectedPost.body.includes('{team}')) {
                    subjectValue = pick(moreTeams);
                    imageSubjectType = 'team';
                } else if (selectedPost.body.includes('{role}')) {
                    subjectValue = pick(moreRoles);
                    imageSubjectType = 'role';
                } else {
                    subjectValue = '';
                    imageSubjectType = null;
                }

                // Generate other random values
                const rank = pick(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']);
                const number = Math.floor(Math.random() * 1000) + 100;
                const years = Math.floor(Math.random() * 15) + 5;

                // Replace placeholders
                postBody = selectedPost.body
                    .replace('{game}', imageSubjectType === 'game' ? subjectValue : pick(favouriteGames))
                    .replace('{rank}', rank)
                    .replace('{team}', imageSubjectType === 'team' ? subjectValue : pick(moreTeams))
                    .replace('{item}', imageSubjectType === 'item' ? subjectValue : pick(moreItems))
                    .replace('{role}', imageSubjectType === 'role' ? subjectValue : pick(moreRoles))
                    .replace('{number}', number)
                    .replace('{years}', years);

                // Image logic
                if (imageSubjectType === 'game') {
                    imageURL = await fetchGameImage(subjectValue, templateCategory.type);
                } else {
                    // Use fallback image for non-game posts
                    imageURL = getFallbackImage(templateCategory.type);
                }

            } else {
                // Text-only post
                const textTemplate = pick(textOnlyTemplates);
                const game = pick(author.favourite_games.length ? author.favourite_games : favouriteGames);
                const rank = pick(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']);
                const years = Math.floor(Math.random() * 15) + 5;

                postBody = textTemplate
                    .replace('{game}', game)
                    .replace('{rank}', rank)
                    .replace('{years}', years);
            }

            // Randomize post time (within last 60 days)
            const createdAt = new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000));

            // Generate random likes from other users
            const potentialLikers = userIDs.filter(id => !id.equals(author._id));
            const likeCount = Math.floor(Math.random() * 50);
            const likes = shuffleArray([...potentialLikers]).slice(0, likeCount);

            posts.push(new Post({
                userID: author._id,
                display_name: author.display_name,
                body: postBody,
                imageURL: imageURL,
                visibility: Math.random() > 0.3 ? 'everyone' : 'connections',
                likeCount: likes.length,
                likes: likes,
                comments: [],
                createdAt: createdAt
            }));
        }

        await Post.insertMany(posts);

        res.status(201).json({
            message: 'Enhanced mock users and posts generated successfully!',
            usersCount: createdUsers.length,
            postsCount: posts.length,
            stats: {
                countries: countries.length,
                games: favouriteGames.length,
                genres: favouriteGenres.length,
                postsWithImages: posts.filter(p => p.imageURL).length,
                textOnlyPosts: posts.filter(p => !p.imageURL).length
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error generating enhanced mock data' });
    }
});

module.exports = router;