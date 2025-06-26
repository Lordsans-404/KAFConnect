"use client"

import { useState,useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProfileData {
  phoneNumber: string
  idCardNumber: string
  address: string
  city: string
  stateProvince: string
  postalCode: string
  bio: string
}

interface ProfileFormProps {
  token: string
  data_user: {
    user: {
      id: string
    }
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export function ProfileForm({ token, data_user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [changedItems, setChangedItems] = useState<ChangedItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    phoneNumber: "",
    idCardNumber: "",
    address: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    bio: "",
  })
  useEffect(() => {
    if (data_user?.profile) {
      setProfile(data_user.profile);
    }
  }, [data_user?.profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setChangedItems(prev => [
      ...prev.filter(item => item.name !== name),
      { name, value }
    ]);
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    // Untuk menghandle Update
    if(data_user?.profile){
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/profile/${data_user.user.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(Object.fromEntries(changedItems.map(({ name, value }) => [name, value]))),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message.join('\n')); // atau tampilkan di UI
          throw new Error("Validation failed");
        }

        alert("Profile updated successfully!");
        router.push('/dashboard');
      } catch (error) {
        console.log("Error :",error)
      } finally {
        setIsLoading(false);
      }
    }
    // Untuk menghandle Create
    else{
      try {
        const formData = new FormData(event.currentTarget)
        const formValues = Object.fromEntries(formData.entries()) as Record<string, string>

        const profileData: ProfileData = {
          phoneNumber: formValues.phoneNumber,
          idCardNumber: formValues.idCardNumber,
          address: formValues.address,
          city: formValues.city,
          stateProvince: formValues.stateProvince,
          postalCode: formValues.postalCode,
          bio: formValues.bio
        }

        const response = await fetch(
          `${API_BASE_URL}/users/profile/${data_user.user.id}`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          }
        )

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message.join('\n')); // atau tampilkan di UI
          throw new Error("Validation failed");
        }

        alert("Profile submitted successfully!")
        router.push('/dashboard')
      } catch (error) {
        console.log("Error :",error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          id="phoneNumber"
          label="Phone Number"
          placeholder="0845 2425 2005"
          value={profile.phoneNumber}
          onChange={handleChange}
          required
          disabled={isLoading}
        />

        <FormField
          id="idCardNumber"
          label="Identity Card Number"
          placeholder="0012233445566778"
          value={profile.idCardNumber}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <TextareaField
        id="address"
        label="Address"
        placeholder="Enter your full address"
        value={profile.address}
        onChange={handleChange}
        required
        disabled={isLoading}
        rows={4}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          id="city"
          label="City"
          placeholder="City"
          value={profile.city}
          onChange={handleChange}
          required
          disabled={isLoading}
        />

        <FormField
          id="stateProvince"
          label="State/Province"
          placeholder="State/Province"
          value={profile.stateProvince}
          onChange={handleChange}
          required
          disabled={isLoading}
        />

        <FormField
          id="postalCode"
          label="Zip/Postal Code"
          placeholder="Zip/Postal Code"
          value={profile.postalCode}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <TextareaField
        id="bio"
        label="Bio"
        placeholder="Tell us about yourself, your skills, and experience"
        disabled={isLoading}
        value={profile.bio}
        onChange={handleChange}
        rows={6}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  )
}

// Helper component for input fields
const FormField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  id: string
  label: string
  placeholder: string
  value?: any
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      name={id}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  </div>
)



// Helper component for textarea fields
const TextareaField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  rows = 4,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  required?: boolean
  disabled?: boolean
  rows?: number
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Textarea
      id={id}
      name={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`min-h-[${rows * 25}px]`}
    />
  </div>
)
