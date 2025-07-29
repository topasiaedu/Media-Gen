/**
 * Profile Component
 * User profile management integrated with authentication
 */

import React, { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { authApi } from "../../api/authApi";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  joinDate: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  general?: string;
}

/**
 * Profile component for authenticated users
 */
const Profile: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    emailVerified: false,
    joinDate: ""
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  /**
   * Load user profile data
   */
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const profile = await authApi.getUserProfile();
        if (profile) {
          setProfileData({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email,
            emailVerified: profile.emailVerified,
            joinDate: profile.createdAt || ""
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setErrors({ general: "Failed to load profile data" });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadProfile();
    }
  }, [user, authLoading]);

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Clear field-specific errors
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (profileData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (profileData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle profile save
   */
  const handleSave = async (): Promise<void> => {
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});

    try {
      await authApi.updateUserMetadata({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        full_name: `${profileData.firstName.trim()} ${profileData.lastName.trim()}`
      });

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({ 
        general: error instanceof Error ? error.message : "Failed to update profile" 
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancel editing
   */
  const handleCancel = (): void => {
    // Reset form to original data
    if (user) {
      setProfileData(prev => ({ ...prev }));
    }
    setIsEditing(false);
    setErrors({});
    setSuccessMessage("");
  };

  /**
   * Format join date
   */
  const formatJoinDate = (dateString: string): string => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (): string => {
    const first = profileData.firstName.charAt(0).toUpperCase();
    const last = profileData.lastName.charAt(0).toUpperCase();
    return first + last || profileData.email.charAt(0).toUpperCase();
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <CheckCircle className="text-green-500" size={18} />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
          <AlertCircle className="text-red-500" size={18} />
          <p className="text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {getUserInitials()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
              <p className="text-gray-600">Manage your account information</p>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.firstName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-900">{profileData.firstName || "Not set"}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.lastName ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <User size={18} className="text-gray-400" />
                  <span className="text-gray-900">{profileData.lastName || "Not set"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Mail size={18} className="text-gray-400" />
              <span className="text-gray-900">{profileData.email}</span>
              {profileData.emailVerified ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <AlertCircle size={16} className="text-orange-500" />
              )}
            </div>
            {!profileData.emailVerified && (
              <p className="mt-1 text-sm text-orange-600">
                Email not verified. Check your inbox for a verification link.
              </p>
            )}
          </div>

          {/* Join Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-gray-900">{formatJoinDate(profileData.joinDate)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 