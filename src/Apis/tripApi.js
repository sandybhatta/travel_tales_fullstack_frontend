import mainApi from "./axios.js";

export const getOwnTrips = async (userId) => {
    try {
        const response = await mainApi.get(`/api/trips/${userId}/own-trip`);
        return response.data;
    } catch (error) {
        console.error("Error fetching own trips:", error);
        throw error;
    }
};

export const getCollaboratedTrips = async (userId) => {
    try {
        const response = await mainApi.get(`/api/trips/${userId}/collaborated-trip`);
        return response.data;
    } catch (error) {
        console.error("Error fetching collaborated trips:", error);
        throw error;
    }
};
