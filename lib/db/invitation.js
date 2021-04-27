/* Global Imports */
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/* Local Imports */
import sequelize, { buildParams } from './sql';
import AppError from '../common/appError';
import {
  INVITATION_NOT_FOUND, NOT_FOUND, INVITATION_CREATE_FAILED,
  INVITATION_UPDATE_FAILED, INVITATION_DELETE_FAILED,
  INVITATION_CODE_INVALID, INVITATION_CODE_EXPIRED, INVITATION_RESEND_FAILED,
  INVITATION_CODE_USED,
} from '../common/errorCodes';
import {
  DATE_OP, TABLES, INVITATION_EXPIRY_IN_DAYS, INVITATION_STATUS,
} from '../common/constant';
import {
  getIsoDate, dateInPast,
  getInsertedId, getRowCount,
} from '../common/utility';

export default class Invitation {
  static async list(OrganizationId) {
    const { params, replacements } = buildParams({ OrganizationId });

    const invitations = await sequelize.query(`EXEC [dbo].[usp_Invitations_SelectBy_OrganizationId] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    return invitations;
  }

  static async get(InvitationId) {
    const { params, replacements } = buildParams({ InvitationId });

    const [invitation] = await sequelize.query(`EXEC [dbo].[sp_Invitation_Select] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (invitation) {
      return invitation;
    }

    throw new AppError(INVITATION_NOT_FOUND, `invitation with InvitationId: ${InvitationId} does not exists.`, NOT_FOUND);
  }

  static async getByInvitationCode(InvitationCode) {
    const { params, replacements } = buildParams({ InvitationCode });

    const [invitation] = await sequelize.query(`EXEC [dbo].[usp_Invitation_Select_ByInvitationCode] ${params}`, {
      type: QueryTypes.SELECT,
      replacements,
    });

    if (invitation) {
      return invitation;
    }

    throw new AppError(INVITATION_CODE_INVALID, 'Provided invitation code is invalid.', NOT_FOUND);
  }

  static async create(OrganizationId, record, UserId = null) {
    try {
      record.InvitationCode = uuidv4();
      record.CreatedDateTime = getIsoDate();
      record.CreatedBy = UserId;
      record.InvitationExpireDate = getIsoDate({ op: DATE_OP.ADD, days: INVITATION_EXPIRY_IN_DAYS });

      const { params, replacements } = buildParams({ ...record, OrganizationId }, TABLES.INVITATION);

      const InvitationId = await sequelize.query(`EXEC [dbo].[sp_Invitation_Insert] ${params}`, {
        type: QueryTypes.INSERT,
        replacements,
      });

      return { ...replacements, InvitationId: getInsertedId(InvitationId) };
    } catch (error) {
      throw new AppError(INVITATION_CREATE_FAILED, error.message);
    }
  }

  static async update(OrganizationId, InvitationId, UserId = null, record) {
    try {
      record.UpdatedBy = UserId;
      record.UpdatedDateTime = getIsoDate();

      const { params, replacements } = buildParams({ ...record, InvitationId, OrganizationId }, TABLES.INVITATION);

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Invitation_Update] ${params}`, {
        type: QueryTypes.UPDATE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return replacements;
      }

      throw new AppError(INVITATION_UPDATE_FAILED, `Unable to find record with OrganizationId: ${OrganizationId} and InvitationId: ${InvitationId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(INVITATION_UPDATE_FAILED, error.message);
    }
  }

  static async rm(InvitationId) {
    try {
      const { params, replacements } = buildParams({ InvitationId });

      let rowCount = await sequelize.query(`EXEC [dbo].[sp_Invitation_Delete] ${params}`, {
        type: QueryTypes.DELETE,
        replacements,
      });

      rowCount = getRowCount(rowCount);

      if (rowCount) {
        return;
      }

      throw new AppError(INVITATION_UPDATE_FAILED, `Unable to find record with InvitationId: ${InvitationId}`, NOT_FOUND);
    } catch (error) {
      throw new AppError(INVITATION_DELETE_FAILED, error.message);
    }
  }

  static async validate({ InvitationCode, Email }) {
    try {
      const invitation = await Invitation.getByInvitationCode(InvitationCode);

      if (invitation.Email !== Email) {
        throw new AppError(INVITATION_CODE_INVALID, 'Provided invitation code is invalid.', NOT_FOUND);
      } else if (dateInPast(invitation.InvitationExpireDate)) {
        throw new AppError(INVITATION_CODE_EXPIRED, 'Provided invitation code is expired.', NOT_FOUND);
      } else if (invitation.Status === INVITATION_STATUS.REGISTERED) {
        throw new AppError(INVITATION_CODE_USED, 'Provided invitation code is already used.', NOT_FOUND);
      }

      return { organizationId: invitation.OrganizationId };
    } catch (error) {
      throw new AppError(INVITATION_DELETE_FAILED, error.message);
    }
  }

  static markExpired({
    invitation, UserId = null,
  }) {
    try {
      invitation.Status = INVITATION_STATUS.EXPIRED;

      return Invitation.update(invitation.OrganizationId, invitation.InvitationId, UserId, invitation);
    } catch (error) {
      throw new AppError(INVITATION_UPDATE_FAILED, error.message);
    }
  }

  static markRegistered({
    invitation, UserId, SubId,
  }) {
    try {
      invitation.UserId = UserId;
      invitation.SubId = SubId;
      invitation.Status = INVITATION_STATUS.REGISTERED;

      return Invitation.update(invitation.OrganizationId, invitation.InvitationId, UserId, invitation);
    } catch (error) {
      throw new AppError(INVITATION_UPDATE_FAILED, error.message);
    }
  }

  static async resend({
    OrganizationId, InvitationId, UpdatedBy,
  }) {
    try {
      const invitation = await Invitation.get(InvitationId);
      if (invitation.Status !== INVITATION_STATUS.REGISTERED) {
        delete invitation.InvitationCode;
        invitation.InvitationExpireDate = getIsoDate({ op: DATE_OP.ADD, days: INVITATION_EXPIRY_IN_DAYS });

        return Invitation.update(OrganizationId, InvitationId, UpdatedBy, invitation);
      }

      throw new Error('Provided invitation id is already in registered state.');
    } catch (error) {
      throw new AppError(INVITATION_RESEND_FAILED, error.message);
    }
  }
}
