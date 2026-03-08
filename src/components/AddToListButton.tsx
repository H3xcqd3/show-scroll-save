import { useState, useEffect } from 'react';
import { useCustomLists, CustomList } from '@/hooks/useCustomLists';
import { MediaItem, MediaType } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ListPlus, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddToListButtonProps {
  item: MediaItem;
  mediaType: MediaType;
}

const AddToListButton = ({ item, mediaType }: AddToListButtonProps) => {
  const { lists, addItem } = useCustomLists();
  const { toast } = useToast();
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());

  const handleAdd = async (list: CustomList) => {
    await addItem(list.id, item, mediaType);
    setAddedTo(prev => new Set(prev).add(list.id));
    toast({ title: `Added to "${list.name}"` });
  };

  if (lists.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ListPlus className="h-4 w-4" />
          Add to List
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {lists.map(list => (
          <DropdownMenuItem
            key={list.id}
            onClick={() => handleAdd(list)}
            className="gap-2"
          >
            {addedTo.has(list.id) ? <Check className="h-3.5 w-3.5 text-primary" /> : <ListPlus className="h-3.5 w-3.5" />}
            {list.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToListButton;
