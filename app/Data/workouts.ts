import { chest } from "./chest";
import { back } from "./back";
import { biceps } from "@/app/Data/biceps";
import { triceps } from "@/app/Data/triceps";
import { shoulders } from "@/app/Data/shoulders";
import { legs } from "@/app/Data/legs";
import { abs } from "@/app/Data/abs";
import { forearms } from "@/app/Data/forearms";

export const workouts = {
  chest: {
    title: "Chest Exercises",

    sections: [
      {
        title: "Upper Chest",
        slug: "upper-chest",
        exerciseCount: Object.values(chest).filter(
          (exercise) => exercise.section === "upper-chest"
        ).length,
        image: "/chest/upper-chest.png",
      },
      {
        title: "Mid Chest",
        slug: "mid-chest",
        exerciseCount: Object.values(chest).filter(
          (exercise) => exercise.section === "mid-chest"
        ).length,
        image: "/chest/mid-chest.png",
      },
      {
        title: "Lower Chest",
        slug: "lower-chest",
        exerciseCount: Object.values(chest).filter(
          (exercise) => exercise.section === "lower-chest"
        ).length,
        image: "/chest/lower-chest.webp",
      },
    ],
  },

  back: {
    title: "Back Exercises",

    sections: [
      {
        title: "Upper Back",
        slug: "upper-back",
        exerciseCount: Object.values(back).filter(
          (exercise) => exercise.section === "upper-back"
        ).length,
        image: "/back/upper-back.png",
      },
      {
        title: "Mid Back",
        slug: "mid-back",
        exerciseCount: Object.values(back).filter(
          (exercise) => exercise.section === "mid-back"
        ).length,
        image: "/back/mid-back.png",
      },
      {
        title: "Lower Back",
        slug: "lower-back",
        exerciseCount: Object.values(back).filter(
          (exercise) => exercise.section === "lower-back"
        ).length,
        image: "/back/lower-back.png",
      },
    ],
  },
  biceps: {
    title: "Biceps Exercises",

    sections: [
      {
        title: "Long Head",
        slug: "long-head",
        exerciseCount: Object.values(biceps).filter(
          (exercise) => exercise.section === "long-head"
        ).length,
        image: "/biceps/long-head.png",
      },
      {
        title: "Short Head",
        slug: "short-head",
        exerciseCount: Object.values(biceps).filter(
          (exercise) => exercise.section === "short-head"
        ).length,
        image: "/biceps/short-head.png",
      },
      {
        title: "Brachialis",
        slug: "brachialis",
        exerciseCount: Object.values(biceps).filter(
          (exercise) => exercise.section === "brachialis"
        ).length,
        image: "/biceps/brachialis.png",
      },
    ],
  },

  triceps: {
    title: "Triceps Exercises",

    sections: [
      {
        title: "Long Head",
        slug: "long-head",
        exerciseCount: Object.values(triceps).filter(
          (exercise) => exercise.section === "long-head"
        ).length,
        image: "/triceps/long-head.png",
      },
      {
        title: "Lateral Head",
        slug: "lateral-head",
        exerciseCount: Object.values(triceps).filter(
          (exercise) => exercise.section === "lateral-head"
        ).length,
        image: "/triceps/lateral-head.png",
      },
      {
        title: "Medial Head",
        slug: "medial-head",
        exerciseCount: Object.values(triceps).filter(
          (exercise) => exercise.section === "medial-head"
        ).length,
        image: "/triceps/medial-head.png",
      },
    ],
  },

  shoulders: {
    title: "Shoulders Exercises",

    sections: [
      {
        title: "Front Delts",
        slug: "front-delts",
        exerciseCount: Object.values(shoulders).filter(
          (exercise) => exercise.section === "front-delts"
        ).length,
        image: "/shoulders/front-delts.png",
      },
      {
        title: "Side Delts",
        slug: "side-delts",
        exerciseCount: Object.values(shoulders).filter(
          (exercise) => exercise.section === "side-delts"
        ).length,
        image: "/shoulders/side-delts.png",
      },
      {
        title: "Rear Delts",
        slug: "rear-delts",
        exerciseCount: Object.values(shoulders).filter(
          (exercise) => exercise.section === "rear-delts"
        ).length,
        image: "/shoulders/rear-delts.png",
      },
    ],
  },
  legs: {
    title: "Legs Exercises",

    sections: [
      {
        title: "Quads",
        slug: "quads",
        exerciseCount: Object.values(legs).filter(
          (exercise) => exercise.section === "quads"
        ).length,
        image: "/legs/quads.png",
      },
      {
        title: "Hamstrings",
        slug: "hamstrings",
        exerciseCount: Object.values(legs).filter(
          (exercise) => exercise.section === "hamstrings"
        ).length,
        image: "/legs/hamstrings.png",
      },
      {
        title: "Glutes",
        slug: "glutes",
        exerciseCount: Object.values(legs).filter(
          (exercise) => exercise.section === "glutes"
        ).length,
        image: "/legs/glutes.png",
      },
      {
        title: "Calves",
        slug: "calves",
        exerciseCount: Object.values(legs).filter(
          (exercise) => exercise.section === "calves"
        ).length,
        image: "/legs/calves.png",
      },
    ],
  },
  abs: {
    title: "Abs Exercises",

    sections: [
      {
        title: "Upper Abs",
        slug: "upper-abs",
        exerciseCount: Object.values(abs).filter(
          (exercise) => exercise.section === "upper-abs"
        ).length,
        image: "/abs/upper-abs.png",
      },
      {
        title: "Lower Abs",
        slug: "lower-abs",
        exerciseCount: Object.values(abs).filter(
          (exercise) => exercise.section === "lower-abs"
        ).length,
        image: "/abs/lower-abs.png",
      },
      {
        title: "Obliques",
        slug: "obliques",
        exerciseCount: Object.values(abs).filter(
          (exercise) => exercise.section === "obliques"
        ).length,
        image: "/abs/obliques.png",
      },
    ],
  },

  forearms: {
    title: "Forearms Exercises",

    sections: [
      {
        title: "All Exercises",
        slug: "forearms",
        exerciseCount: Object.values(forearms).length,
        image: "/forearms/forearms.png",
      },
    ],
  },
};