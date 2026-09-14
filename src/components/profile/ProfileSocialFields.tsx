import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PROFILE_CATEGORIES,
  SOCIAL_NETWORKS,
  toggleProfileCategory,
  type ProfileCategoryKey,
  type SocialNetworkKey,
} from "@/lib/profileSocial";

type ProfileSocialFieldsProps = {
  categories: ProfileCategoryKey[];
  onCategoriesChange: (next: ProfileCategoryKey[]) => void;
  socialDrafts: Record<SocialNetworkKey, string>;
  onSocialDraftChange: (key: SocialNetworkKey, value: string) => void;
  socialErrors?: Partial<Record<SocialNetworkKey, string>>;
};

export default function ProfileSocialFields({
  categories,
  onCategoriesChange,
  socialDrafts,
  onSocialDraftChange,
  socialErrors,
}: ProfileSocialFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Categorias</Label>
        <p className="text-xs text-gray-500">
          Escolha uma ou mais. Só as selecionadas aparecem no perfil público.
        </p>
        <div className="flex flex-wrap gap-2">
          {PROFILE_CATEGORIES.map((category) => {
            const selected = categories.includes(category.key);
            return (
              <button
                type="button"
                key={category.key}
                onClick={() => onCategoriesChange(toggleProfileCategory(categories, category.key))}
                className={cn(
                  "min-h-11 px-3 rounded-full text-sm font-medium border transition-colors",
                  selected
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-gray-100 dark:bg-[#2A3B42] text-gray-700 dark:text-gray-300 border-transparent",
                )}
                aria-pressed={selected}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Links sociais</Label>
        <p className="text-xs text-gray-500">Apenas URLs https://. Campos vazios não aparecem.</p>
        <div className="space-y-3">
          {SOCIAL_NETWORKS.map((network) => (
            <div key={network.key} className="space-y-1">
              <label
                htmlFor={`social-${network.key}`}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {network.label}
              </label>
              <Input
                id={`social-${network.key}`}
                type="url"
                inputMode="url"
                placeholder={network.placeholder}
                value={socialDrafts[network.key]}
                onChange={(event) => onSocialDraftChange(network.key, event.target.value)}
                className={cn(socialErrors?.[network.key] && "border-red-500")}
              />
              {socialErrors?.[network.key] ? (
                <p className="text-xs text-red-500">{socialErrors[network.key]}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
