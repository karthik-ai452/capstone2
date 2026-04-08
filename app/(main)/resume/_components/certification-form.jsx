"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { certificationSchema } from "@/app/lib/schema";

export function CertificationForm({ entries = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: "",
      issuer: "",
      credentialUrl: "",
    },
  });

  const closeForm = () => {
    reset({
      name: "",
      issuer: "",
      credentialUrl: "",
    });
    setEditingIndex(null);
    setIsOpen(false);
  };

  const handleSave = handleSubmit((data) => {
    const nextEntries = [...entries];

    if (editingIndex !== null) {
      nextEntries[editingIndex] = data;
    } else {
      nextEntries.push(data);
    }

    onChange(nextEntries);
    closeForm();
  });

  const handleEdit = (index) => {
    reset(entries[index]);
    setEditingIndex(index);
    setIsOpen(true);
  };

  const handleDelete = (index) => {
    onChange(entries.filter((_, itemIndex) => itemIndex !== index));
    if (editingIndex === index) {
      closeForm();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={`${item.name}-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => handleEdit(index)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => handleDelete(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{item.issuer}</p>
              {item.credentialUrl ? (
                <a
                  href={item.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  View credential
                </a>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingIndex !== null ? "Edit Certification" : "Add Certification"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Certification name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Issuer"
                {...register("issuer")}
              />
              {errors.issuer && (
                <p className="text-sm text-red-500">{errors.issuer.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Credential link"
                {...register("credentialUrl")}
              />
              {errors.credentialUrl && (
                <p className="text-sm text-red-500">
                  {errors.credentialUrl.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              {editingIndex !== null ? "Save Changes" : "Add Certification"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isOpen && (
        <Button
          className="w-full"
          variant="outline"
          type="button"
          onClick={() => {
            reset({
              name: "",
              issuer: "",
              credentialUrl: "",
            });
            setEditingIndex(null);
            setIsOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Certification
        </Button>
      )}
    </div>
  );
}
