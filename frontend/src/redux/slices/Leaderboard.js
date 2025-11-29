import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

const LIST_URL = "/Tracker/getAll";
const TOP_URL = "/Tracker/getTop";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchPage = createAsyncThunk(
  "leaderboard/fetchPage",
  async ({ page = 0, limit = 10, language, year } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(LIST_URL, {
        params: { page, limit, language, year },
        headers: getAuthHeaders(),
      });
      return { users: res.data.users || [], total: res.data.total || 0, page, limit };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchTop = createAsyncThunk(
  "leaderboard/fetchTop",
  async ({ language, year, limit = 3 } = {}, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(TOP_URL, {
        params: { limit, language, year },
        headers: getAuthHeaders(),
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState: {
    pageUsers: [],
    topUsers: [],
    total: 0,
    page: 0,
    limit: 10,
    loading: false,
    error: null,
  },
  reducers: {
    setLimit(state, action) { state.limit = action.payload; },
    setPage(state, action) { state.page = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPage.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPage.fulfilled, (state, action) => {
        state.loading = false;
        state.pageUsers = action.payload.users || [];
        state.total = action.payload.total || 0;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
      })
      .addCase(fetchTop.fulfilled, (state, action) => {
        state.topUsers = action.payload || [];
      })
      .addCase(fetchTop.rejected, (state, action) => {
        // optional handling
      });
  }
});

export const { setLimit, setPage } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
