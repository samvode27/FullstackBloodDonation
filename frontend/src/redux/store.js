import { configureStore } from "@reduxjs/toolkit";

import adminReducer from './adminRedux'
import donorReducer from "./donorRedux";
import hospitalReducer from "./hospitalRedux";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const adminPersistConfig = {
  key: "admin",
  version: 1,
  storage,
};

const donorPersistConfig = {
  key: "donor",
  version: 1,
  storage,
};

const hospitalPersistConfig = {
  key: "hospital",
  version: 1,
  storage,
};

// const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    admin: persistReducer(adminPersistConfig, adminReducer),
    donor: persistReducer(donorPersistConfig, donorReducer),
    hospital: persistReducer(hospitalPersistConfig, hospitalReducer),
    
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);