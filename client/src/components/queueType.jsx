const QueueInfo = ({ queueId }) => {
    const [queueData, setQueueData] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchQueueInfo = async () => {
        try {
          const graphqlQuery = `
            query getQueueType($queueId: Int!) {
              queueType(queueId: $queueId) {  # Ensure this matches the schema
                queueId
                map
                description
                notes
              }
            }
          `;
  
          const response = await axios.post('/graphql', {
            query: graphqlQuery,
            variables: { queueId }
          });
  
          setQueueData(response.data.data.queueType);
        } catch (error) {
          console.error('Error fetching queue type:', error);
          setError('Failed to fetch queue type');
        }
      };
  
      fetchQueueInfo();
    }, [queueId]);
  
    if (error) {
      return <div>{error}</div>;
    }
  
    if (!queueData) {
      return <div>Loading queue information...</div>;
    }
  
    return (
      <div>
        <p>{queueData.description}</p>
      </div>
    );
  };

  export default QueueInfo;