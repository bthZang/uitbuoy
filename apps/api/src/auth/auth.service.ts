import { User } from '@/user/entities/user.entity';
import { UserService } from '@/user/services/user.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import moment from 'moment';
import { MoodleException } from 'src/api/errors/moodle.error';
import { UserApiService } from 'src/api/services/user-api.service';
import API_URL from 'src/common/constants/url';
import { AuthEntity } from './entities/auth.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly userApiService: UserApiService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(
        username: string,
        password: string,
    ): Promise<AuthEntity> {
        const response = await axios.post(API_URL.authentication, null, {
            params: { username, password, service: 'moodle_mobile_app' },
        });

        if (!response.data.token) {
            throw new MoodleException(
                response.data.exception,
                response.data.errorcode,
                response.data.error,
            );
        }

        const userDataFromDB = await this.userService.findByUsername(username);

        if (userDataFromDB) {
            return {
                isFirstTimeLogin: false,
                ...userDataFromDB,
                token: response.data.token,
            };
        }

        const userData = await this.userApiService.getUserProfile({
            username,
            token: response.data.token,
        });

        await this.userService.create(userData);

        return {
            isFirstTimeLogin: true,
            ...userData,
            token: response.data.token,
        };
    }

    generateToken(authEntity: AuthEntity) {
        const access_token = this.jwtService.sign(
            {
                ...authEntity,
                sub: authEntity.username,
            },
            {
                secret: this.configService.get('ACCESS_TOKEN_SECRET'),
                expiresIn:
                    this.configService.get('ENVIRONMENT') === 'development'
                        ? '100d'
                        : '1h',
            },
        );
        const accessTokenExpiredDate = moment().add(1, 'hour').toDate();

        const refresh_token = this.jwtService.sign(
            {
                ...authEntity,
                sub: authEntity.username,
            },
            {
                secret: this.configService.get('REFRESH_TOKEN_SECRET'),
                expiresIn: '14d',
            },
        );
        const refreshTokenExpiredDate = moment().add(14, 'days').toDate();

        return {
            access_token,
            refresh_token,
            accessTokenExpiredDate,
            refreshTokenExpiredDate,
        };
    }

    refreshToken(user: User) {
        const access_token = this.jwtService.sign(
            {
                ...user,
                sub: user.username,
            },
            { secret: this.configService.get('ACCESS_TOKEN_SECRET') },
        );
        const accessTokenExpiredDate = moment().add(1, 'hour').toDate();

        return { access_token, accessTokenExpiredDate };
    }
}
