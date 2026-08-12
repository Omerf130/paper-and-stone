import mongoose, { Schema, type Document, type Model, Types } from "mongoose";

export interface IProfessionalProfile extends Document {
  userId: Types.ObjectId;
  fullName?: string;
  phone?: string;
  companyName?: string;
  city?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const professionalProfileSchema = new Schema<IProfessionalProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, trim: true },
    phone: { type: String, trim: true },
    companyName: { type: String, trim: true },
    city: { type: String, trim: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true },
);

const ProfessionalProfile: Model<IProfessionalProfile> =
  mongoose.models.ProfessionalProfile ??
  mongoose.model<IProfessionalProfile>(
    "ProfessionalProfile",
    professionalProfileSchema,
  );

export default ProfessionalProfile;
