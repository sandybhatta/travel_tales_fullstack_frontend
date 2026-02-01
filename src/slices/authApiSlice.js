import { apiSlice } from "./apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/api/auth/login',
                method: 'POST',
                body: credentials
            })
        }),
        register: builder.mutation({
            query: (data) => ({
                url: '/api/auth/register',
                method: 'POST',
                body: data
            })
        }),
        otpLogin: builder.mutation({
            query: ({ userId, otp }) => ({
                url: '/api/auth/otp-login',
                method: 'POST',
                body: { userId, otp }
            })
        }),
        resendOtp: builder.mutation({
            query: ({ userId, type }) => ({
                url: '/api/auth/resend-otp',
                method: 'POST',
                body: { userId, type }
            })
        }),
        forgotPassword: builder.mutation({
            query: ({ email }) => ({
                url: '/api/auth/forget-password',
                method: 'POST',
                body: { email }
            })
        }),
        resetPassword: builder.mutation({
            query: ({ token, password, email }) => ({
                url: '/api/auth/reset-password',
                method: 'POST',
                body: { token, password, email }
            })
        }),
        verifyEmail: builder.mutation({
            query: (token) => ({
                url: `/api/auth/verify-email?token=${token}`,
                method: 'POST'
            })
        }),
        resendVerificationEmail: builder.mutation({
            query: ({ email }) => ({
                url: '/api/auth/resend-verification',
                method: 'POST',
                body: { email }
            })
        }),
        reactivateUser: builder.mutation({
            query: ({ userId }) => ({
                url: '/api/auth/reactivate-user',
                method: 'POST',
                body: { userId }
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/api/auth/logout',
                method: 'POST',
            })
        })
    })
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useOtpLoginMutation,
    useResendOtpMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyEmailMutation,
    useResendVerificationEmailMutation,
    useReactivateUserMutation,
    useLogoutMutation
} = authApiSlice;
