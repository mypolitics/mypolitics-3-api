import {
  Controller,
  Get,
  UseGuards,
  HttpStatus,
  Req,
  Res,
  Query,
  Post,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import Cookies from 'cookies';
import { Cookies as ConstCookies, ErrorsMessages } from '../../constants';
import dayjs from 'dayjs';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { ErrorCode } from '../../types';
import { ActionTokenType } from './enums/action-token-type.enum';
import { getOrigin } from './utils/get-origin.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    const cookies = new Cookies(req, res);
    const token = await this.authService.createAndGetAccessToken(
      req.user as User,
    );
    cookies.set(ConstCookies.JWT, token, {
      httpOnly: true,
      expires: dayjs()
        .add(7, 'day')
        .toDate(),
    });

    res.redirect(`https://${getOrigin(req)}/editor`);
  }

  @Get('verify')
  async verifyUser(
    @Res() res: Response,
    @Query() { code, userId }: {
      code: string;
      userId: string;
    },
  ): Promise<any> {
    const verified = this.authService.verifyActionToken(code, userId);

    if (verified) {
      res.redirect('/auth?state=verified');
    }
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() { recaptcha }: {
      recaptcha: string;
    },
  ): Promise<any> {
    const cookies = new Cookies(req, res);
    const user = req.user as User;

    const captchaValid = await this.authService.validateReCaptcha(recaptcha);
    if (!captchaValid) {
      throw new BadRequestException();
    }

    if (!user.emailVerified) {
      const lastToken = await this.authService.actionTokensService.findOne(
        { user },
        {},
        {
          sort: {
            expiresOn: 1,
          },
        },
      );
      const lastTokenValid = dayjs(lastToken?.expiresOn).isAfter(dayjs());

      if (lastTokenValid) {
        throw new BadRequestException(
          ErrorsMessages[ErrorCode.EMAIL_NOT_VERIFIED_SENT_IN_15_MIN],
        );
      }

      const token = await this.authService.createAndGetActionToken(
        user,
        ActionTokenType.VERIFY_EMAIL,
      );
      await this.authService.sendEmailConfirm(user, token);
      throw new BadRequestException(
        ErrorsMessages[ErrorCode.EMAIL_NOT_VERIFIED_SENT_NOW],
      );
    }

    const token = await this.authService.createAndGetAccessToken(user);
    cookies.set(ConstCookies.JWT, token, {
      httpOnly: true,
      expires: dayjs()
        .add(7, 'day')
        .toDate(),
    });

    res.status(200).end();
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
    const cookies = new Cookies(req, res);
    cookies.set(ConstCookies.JWT, '', {
      httpOnly: true,
      expires: dayjs().toDate(),
    });

    res.status(200).end();
  }
}
