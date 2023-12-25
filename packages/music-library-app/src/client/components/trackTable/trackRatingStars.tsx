import { Colors } from "@blueprintjs/colors";
import { Star, StarEmpty } from "@blueprintjs/icons";
import { range } from "radash";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";
import styles from "./trackRatingStars.module.scss";

export interface TrackRatingStarsProps {
  trackID: number;
  rating: number | undefined;
}

export default function TrackRatingStars({ trackID: id, rating = 0 }: TrackRatingStarsProps) {
  const numFilledStars = rating / 20;
  const stars = [
    ...range(1, numFilledStars, (i) => (
      <InteractiveStar key={i} isFilled={true} ratingOutOf100={i * 20} trackID={id} />
    )),
    ...range(numFilledStars + 1, 5, (i) => (
      <InteractiveStar key={i} isFilled={false} ratingOutOf100={i * 20} trackID={id} />
    )),
  ];

  if (numFilledStars === 0) {
    // remove the extra 0-rating star generated by range(1, 0) if necessary
    stars.shift();
  }

  return <div className={styles.trackRatingStars}>{stars}</div>;
}

interface InteractiveStarProps {
  isFilled: boolean;
  trackID: number;
  ratingOutOf100: number;
}

function InteractiveStar({ isFilled, ratingOutOf100, trackID }: InteractiveStarProps) {
  const setTrackRating = appStore.use.setTrackRating();
  const handleClick = useCallback(() => {
    void setTrackRating(trackID, ratingOutOf100);
  }, [ratingOutOf100, setTrackRating, trackID]);

  return isFilled ? (
    <Star className={styles.starFilled} onClick={handleClick} color={Colors.GOLD4} />
  ) : (
    <StarEmpty className={styles.starEmpty} onClick={handleClick} color={Colors.GOLD4} />
  );
}
