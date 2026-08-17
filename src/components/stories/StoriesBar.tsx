import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import StoryAvatar from "./StoryAvatar";
import StoryViewer from "./StoryViewer";
import CreateStoryModal from "./CreateStoryModal";
import { useStories } from "@/hooks/useStories";
import { useAuth } from "@/contexts/AuthContext";

const StoriesBar = () => {
  const { user } = useAuth();
  const { storyGroups, myStories, isLoading, refetch } = useStories();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMyStories, setShowMyStories] = useState(false);

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleMyStoriesClick = () => {
    if (myStories.length > 0) {
      setShowMyStories(true);
    } else {
      setShowCreateModal(true);
    }
  };

  return (
    <div className="py-4 border-b border-border">
      <ScrollArea className="w-full">
        <div className="flex gap-4 px-4">
          {/* Add Story Button / My Stories */}
          <StoryAvatar
            name="Você"
            avatarUrl={null}
            isAddButton={myStories.length === 0}
            hasUnseenStory={myStories.length > 0}
            onClick={handleMyStoriesClick}
          />

          {/* Other Users Stories */}
          {storyGroups.map((group, index) => (
            <StoryAvatar
              key={group.userId}
              name={group.userName || "Usuário"}
              avatarUrl={group.userAvatar}
              hasUnseenStory={group.hasUnviewed}
              onClick={() => handleStoryClick(index)}
            />
          ))}

          {/* Placeholder stories when empty */}
          {storyGroups.length === 0 && !isLoading && (
            <>
              <StoryAvatar name="Julia" hasUnseenStory />
              <StoryAvatar name="Gabriel" hasUnseenStory />
              <StoryAvatar name="Ana" hasUnseenStory />
              <StoryAvatar name="Carlos" hasUnseenStory />
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Story Viewer Modal - Other Users */}
      {selectedStoryIndex !== null && storyGroups[selectedStoryIndex] && (
        <StoryViewer
          stories={storyGroups[selectedStoryIndex].stories}
          profile={{
            name: storyGroups[selectedStoryIndex].userName,
            avatar_url: storyGroups[selectedStoryIndex].userAvatar,
          }}
          onClose={() => setSelectedStoryIndex(null)}
          onNext={() => {
            if (selectedStoryIndex < storyGroups.length - 1) {
              setSelectedStoryIndex(selectedStoryIndex + 1);
            } else {
              setSelectedStoryIndex(null);
            }
          }}
          onPrevious={() => {
            if (selectedStoryIndex > 0) {
              setSelectedStoryIndex(selectedStoryIndex - 1);
            }
          }}
        />
      )}

      {/* Story Viewer Modal - My Stories */}
      {showMyStories && myStories.length > 0 && (
        <StoryViewer
          stories={myStories}
          profile={{ name: "Você", avatar_url: null }}
          onClose={() => setShowMyStories(false)}
          onNext={() => setShowMyStories(false)}
          onPrevious={() => {}}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={refetch}
      />
    </div>
  );
};

export default StoriesBar;
