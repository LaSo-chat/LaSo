// src/user/user.controller.ts
import { Controller,Get, Put, Body, Req, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { supabase } from '../auth/supabaseClient';
import { ProfileUpdateDto } from './dto/profile-update.dto';

@Controller('user')
export class UserController {
    constructor(private prisma: PrismaService) {}

    @Put('profile')
    async updateProfile(@Body() profileData: ProfileUpdateDto, @Req() req: Request) {
        const accessToken = req.headers.authorization?.split(' ')[1]; // Extract the token

        // Get the authenticated user from Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error || !user) {
            throw new UnauthorizedException('User is not authenticated');
        }

        // // 1. Update Supabase Auth meta-data
        // const { error: authError } = await supabase.auth.updateUser({
        //     data: {
        //         phone: profileData.phone,
        //         raw_user_meta_data: {
        //             fullName: profileData.fullName,
        //             country: profileData.country,
        //             preferredLang: profileData.preferredLang,
        //         },
        //     },
        // });

        // if (authError) {
        //     throw new Error(`Failed to update Supabase Auth: ${authError.message}`);
        // }

        // 2. Update or Create User record in the database (Prisma)
        const updatedUser = await this.prisma.user.upsert({
            where: { supabaseId: user.id },  // Use the Supabase user ID as a unique identifier
            update: {
                fullName: profileData.fullName,
                phone: profileData.phone,
                country: profileData.country,
                preferredLang: profileData.preferredLang,
            },
            create: {
                supabaseId: user.id,  // Insert the Supabase user ID during record creation
                email: user.email,
                fullName: profileData.fullName,
                phone: profileData.phone,
                country: profileData.country,
                dateOfBirth: new Date(profileData.dateOfBirth),
                preferredLang: profileData.preferredLang,
            },
        });

        return updatedUser;
    }

    // Get user profile
    @Get('profile')
    async getProfile(@Req() req: Request) {
        const accessToken = req.headers.authorization?.split(' ')[1];

        // Get the authenticated user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);
        if (error || !user) {
            throw new UnauthorizedException('User is not authenticated');
        }

        // Fetch user from the database using Prisma
        const userProfile = await this.prisma.user.findUnique({
            where: { supabaseId: user.id },
        });

        if (!userProfile) {
            throw new UnauthorizedException('User profile not found');
        }

        return userProfile;
    }
}
