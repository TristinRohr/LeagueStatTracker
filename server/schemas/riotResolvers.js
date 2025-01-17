const riotApiService = require('../utils/riotAPI');
const axios = require('axios');

const riotResolvers = {
  Query: {
    matchHistory: async (_, { gameName, tagLine }) => {
      try {
        const puuid = await riotApiService.fetchPuuidByRiotId(gameName, tagLine);
        const matchIds = await riotApiService.fetchMatchHistory(puuid);

        const matchDetailsPromises = matchIds.map(async (matchId) => {
          const matchDetails = await riotApiService.fetchMatchDetails(matchId);

          const userParticipant = matchDetails.info.participants.find(
            participant => participant.puuid === puuid
          );

          const participants = matchDetails.info.participants.map(participant => ({
            summonerName: participant.riotIdGameName,
            riotIdTagline: participant.riotIdTagline,
            championName: participant.championName,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            goldEarned: participant.goldEarned,
            totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
            totalMinionsKilled: participant.totalMinionsKilled,
            wardsPlaced: participant.wardsPlaced,
            items: [
              participant.item0,
              participant.item1,
              participant.item2,
              participant.item3,
              participant.item4,
              participant.item5,
              participant.item6,
            ],
            teamId: participant.teamId,
          }));

          const teams = matchDetails.info.teams.map(team => ({
            teamId: team.teamId,
            win: team.win,
          }));
          console.log('teams info:', teams);

          const { queueId } = matchDetails.info;

          console.log('Fected queueId from match details:', queueId);

          const gameStartTimestamp = matchDetails.info.gameStartTimestamp;

          return {
            matchId: matchDetails.metadata.matchId,
            gameStartTimestamp: matchDetails.info.gameStartTimestamp,
            gameDuration: matchDetails.info.gameDuration,
            champion: userParticipant ? userParticipant.championName : null,
            kills: userParticipant ? userParticipant.kills : null,
            deaths: userParticipant ? userParticipant.deaths : null,
            assists: userParticipant ? userParticipant.assists : null,
            participants,
            teams,
            queueId,
          };
        });

        const matchDetails = await Promise.all(matchDetailsPromises);
        return matchDetails;
      } catch (error) {
        console.error('Error in matchHistory resolver:', error.message);
        throw new Error('Failed to fetch match history');
      }
    },

    userStats: async (_, { gameName, tagLine }) => {
      try {
        console.log(`Resolving UserStats for Riot ID: ${gameName}#${tagLine}`);

        // Step 1: Fetch PUUID using the provided function
        const puuid = await riotApiService.fetchPuuidByRiotId(gameName, tagLine);

        // Step 2: Use PUUID to fetch summoner data from Riot API
        const summonerUrl = `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`;
        const summonerResponse = await axios.get(summonerUrl);
        const summonerData = summonerResponse.data;

        console.log('Fetched Summoner Data=======>', summonerData);

        // Step 3: Fetch league data using the summoner ID
        const leagueUrl = `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${process.env.RIOT_API_KEY}`;
        const leagueResponse = await axios.get(leagueUrl);
        const leagueData = leagueResponse.data;

        // Step 4: Return the data in the format of UserStats type
        return {
          id: summonerData.id,
          accountId: summonerData.accountId,
          puuid: summonerData.puuid,
          name: summonerData.name,
          summonerLevel: summonerData.summonerLevel,
          profileIconId: summonerData.profileIconId,
          leagueInfo: leagueData.map(leagueEntry => ({
            queueType: leagueEntry.queueType,
            tier: leagueEntry.tier,
            rank: leagueEntry.rank,
            leaguePoints: leagueEntry.leaguePoints,
            wins: leagueEntry.wins,
            losses: leagueEntry.losses
          })),
        };
      } catch (error) {
        console.error('Error fetching user stats:', error.message);
        throw new Error('Failed to fetch user stats');
      }
    },

    getLiveClientData: async () => {
      try {
        const response = await axios.get('https://127.0.0.1:2999/liveclientdata/allgamedata', {
          httpsAgent: new (require('https').Agent)({
            rejectUnauthorized: false, // Ignore SSL certificate errors
          }),
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching live game data:', error);
        throw new Error('Failed to fetch live game data from the League client.');
      }
    },
    
    queueType: async (_, { queueId }) => {
      try {
        console.log(`Queue ID received from frontend: ${queueId}`); // Log received queueId
        
        const queueData = await riotApiService.queueTypes();  // Fetch static JSON
        console.log('Queue Data fetched:', queueData.map(q => q.queueId)); // Log all available queue IDs for comparison
    
        // Find the queue information that matches the provided queueId
        const queueInfo = queueData.find(queue => queue.queueId === queueId);
        if (!queueInfo) {
          throw new Error(`Queue with ID ${queueId} not found.`);
        }
    
        console.log('Fetched queue info:', queueInfo); // This should log the correct queue info
        return queueInfo;
      } catch (error) {
        console.error('Error fetching queue type:', error);
        throw new Error('Failed to fetch queue type');
      }
    },
  }
};

module.exports = riotResolvers;