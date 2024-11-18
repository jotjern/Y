import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useDebounce from "@/hooks/useDebounce"; // Import the debounce hook
import { HashtagType, UserType } from "@/lib/types";
import { SEARCH_HASHTAGS, SEARCH_USERS } from "@/queries/search";
import { useQuery } from "@apollo/client";
import {
  ChangeEvent,
  KeyboardEvent,
  forwardRef,
  useEffect,
  useState,
} from "react";

interface TextInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  maxChars: number;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ value, onChange, placeholder, maxChars }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionType, setSuggestionType] = useState<"users" | "hashtags">(
      "users",
    );
    const [query, setQuery] = useState("");
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [currentSuggestions, setCurrentSuggestions] = useState<
      (HashtagType | UserType)[]
    >([]);
    const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

    const debouncedQuery = useDebounce(query, 300);

    const {
      data: hashtagsData,
      loading: hashtagsLoading,
      refetch: refetchHashtags,
    } = useQuery<{
      searchHashtags: HashtagType[];
    }>(SEARCH_HASHTAGS, {
      variables: { query: debouncedQuery, page: 1, limit: 5 },
      skip: debouncedQuery.length < 1,
    });

    const {
      data: mentionsData,
      loading: mentionsLoading,
      refetch: refetchUsers,
    } = useQuery<{
      searchUsers: UserType[];
    }>(SEARCH_USERS, {
      variables: { query: debouncedQuery, page: 1, limit: 5 },
      skip: debouncedQuery.length < 1,
    });

    useEffect(() => {
      if (debouncedQuery.length > 0) {
        refetchHashtags();
        refetchUsers();
      }
    }, [debouncedQuery, refetchHashtags, refetchUsers]);

    useEffect(() => {
      if (suggestionType === "users") {
        setCurrentSuggestions(mentionsData?.searchUsers ?? []);
      } else {
        setCurrentSuggestions(hashtagsData?.searchHashtags ?? []);
      }
    }, [
      suggestionType,
      mentionsData?.searchUsers,
      hashtagsData?.searchHashtags,
    ]);

    const handleAutofill = () => {
      const selectedSuggestion = currentSuggestions[activeSuggestionIndex];
      if (!selectedSuggestion) {
        handleInputChange({
          target: {
            value: value + " ",
          },
        } as ChangeEvent<HTMLTextAreaElement>);
        return;
      }
      const currentValue = value.split(" ");
      currentValue.pop();
      const finalSuggestion =
        selectedSuggestion.__typename === "User"
          ? `@${selectedSuggestion.username} `
          : `#${selectedSuggestion.tag} `;
      currentValue.push(finalSuggestion);
      const newValue = currentValue.join(" ");
      if (newValue.length <= maxChars) {
        handleInputChange({
          target: {
            value: newValue,
          },
        } as ChangeEvent<HTMLTextAreaElement>);
      } else {
        handleInputChange({
          target: {
            value: newValue.slice(0, maxChars),
          },
        } as ChangeEvent<HTMLTextAreaElement>);
      }

      setShowSuggestions(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSuggestions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) =>
            prevIndex === currentSuggestions.length - 1 ? 0 : prevIndex + 1,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) =>
            prevIndex === 0 ? currentSuggestions.length - 1 : prevIndex - 1,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleAutofill();
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          const submitEvent = new Event("submit", {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
          e.currentTarget.style.height = "auto";
        }
      }
    };

    useEffect(() => {
      if (ref && "current" in ref && ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
      if (value === "") {
        setShowSuggestions(false);
      }
    }, [value, ref]);

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      const value = e.target.value;
      const lastWord = value.split(" ").pop();

      if (
        (lastWord?.startsWith("@") || lastWord?.startsWith("#")) &&
        lastWord.length > 1 &&
        /^[a-zA-Z0-9]+$/.test(lastWord.slice(-1))
      ) {
        setShowSuggestions(true);
        setQuery(lastWord?.slice(1));
        setSuggestionType(lastWord?.startsWith("@") ? "users" : "hashtags");
        setActiveSuggestionIndex(0);

        if (ref && "current" in ref && ref.current && !showSuggestions) {
          const { offsetLeft: left, offsetTop: top } = getCaretCoordinates(
            ref.current,
          );
          setPopoverPosition({ top, left });
        }
      } else {
        setShowSuggestions(false);
        setQuery("");
      }

      if (ref && "current" in ref && ref.current) {
        ref.current.style.height = "auto";
        ref.current.style.height = `${ref.current.scrollHeight}px`;
      }
    };

    const getCaretCoordinates = (textarea: HTMLTextAreaElement) => {
      const { selectionStart } = textarea;
      const clonedDiv = document.createElement("div");
      const style = getComputedStyle(textarea);

      clonedDiv.style.position = "absolute";
      clonedDiv.style.whiteSpace = "pre-wrap";
      clonedDiv.style.overflowWrap = "break-word";
      clonedDiv.style.visibility = "hidden";
      clonedDiv.style.minHeight = "3rem";
      clonedDiv.style.fontSize = style.fontSize;
      clonedDiv.style.fontFamily = style.fontFamily;
      clonedDiv.style.lineHeight = style.lineHeight;
      clonedDiv.style.padding = style.padding;
      clonedDiv.style.border = style.border;
      clonedDiv.style.width = `${textarea.offsetWidth}px`;

      const textBeforeCaret = textarea.value.substring(0, selectionStart);
      clonedDiv.textContent = textBeforeCaret.replace(/\n/g, "\u00a0\n");

      document.body.appendChild(clonedDiv);

      const span = document.createElement("span");
      span.textContent = textBeforeCaret.slice(-1) || "\u00a0";
      clonedDiv.appendChild(span);

      const { offsetLeft, offsetTop } = span;
      document.body.removeChild(clonedDiv);

      return { offsetLeft, offsetTop };
    };

    return (
      <div className="relative w-full">
        <Popover open={showSuggestions}>
          <PopoverTrigger asChild>
            <textarea
              ref={ref}
              value={value}
              maxLength={maxChars}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="mt-1 block min-h-12 w-full max-w-xl resize-none rounded-md bg-transparent outline-none"
            />
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            sideOffset={popoverPosition.top < 50 ? popoverPosition.top - 24 : 0}
            alignOffset={popoverPosition.left}
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="overflow-hidden p-0"
          >
            {hashtagsLoading || mentionsLoading ? (
              <p className="w-full p-2">Loading...</p>
            ) : currentSuggestions.length > 0 ? (
              <div className="flex w-full appearance-none flex-col overflow-hidden outline-none">
                {currentSuggestions.map((suggestion, index) => (
                  <div
                    key={
                      suggestion.__typename === "User"
                        ? suggestion.id
                        : suggestion.tag
                    }
                    className={`w-full cursor-pointer p-2 ${
                      index === activeSuggestionIndex
                        ? "bg-blue-500 text-white dark:bg-blue-800"
                        : ""
                    }`}
                    onClick={handleAutofill}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                  >
                    {suggestion.__typename === "User"
                      ? suggestion.username
                      : suggestion.tag}
                  </div>
                ))}
              </div>
            ) : (
              <p className="w-full p-2">No matching {suggestionType}</p>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

export default TextInput;
