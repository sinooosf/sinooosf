import { ShareNetwork, Globe, StarFour } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import Reveal from './Reveal';
import { fetchPublicContent } from '../lib/api';

import PhotoProfile from '../assests/sinoo-bg.png';
import PhotoProfileLookingAway from '../assests/2sinoo-bg.png';

const defaultStatus = 'Available for Freelance';

const stats = [
  { value: '1+', label: <>Years <br /> Learning</> },
  { value: '05+', label: <>Projects <br /> Built</> },
  { value: '∞', label: <>Ideas <br /> Creating</> },
];

export default function Hero({ onOpenContact }) {

  // Controls the image transition
  const [scrollProgress, setScrollProgress] = useState(0);
  const [statusText, setStatusText] = useState(defaultStatus);

  useEffect(() => {
    fetchPublicContent()
      .then((data) => {
        const active = Array.isArray(data.status) ? data.status.find((item) => item.active) || data.status[0] : null;
        if (active?.label || active?.value) setStatusText(active.label || active.value);
      })
      .catch(() => {})
  }, []);

  useEffect(() => {

    const handleScroll = () => {

      /*
        0px scroll   = first image
        30px scroll  = transition started
        60px scroll  = halfway
        100px scroll = second image
      */

      const progress = Math.min(
        window.scrollY / 100,
        1
      );

      setScrollProgress(progress);
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    // Make sure it starts correctly
    handleScroll();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };

  }, []);

  return (

    <header className="relative h-screen overflow-hidden border-b border-red-900/80">

      {/* ================================================= */}
      {/* STICKY HERO */}
      {/* ================================================= */}

      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ================================================= */}
        {/* IMAGE 1 — LOOKING AT CAMERA */}
        {/* ================================================= */}

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${PhotoProfile})`,
            opacity: 1 - scrollProgress,
          }}
        />

        {/* ================================================= */}
        {/* IMAGE 2 — LOOKING AWAY */}
        {/* ================================================= */}

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${PhotoProfileLookingAway})`,
            opacity: scrollProgress,
          }}
        />

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="relative z-10 grid min-h-screen w-full px-5 pt-6 sm:px-10 sm:pt-8">

          {/* ================================================= */}
          {/* TOP BAR */}
          {/* ================================================= */}

          <div
            className="
              flex
              h-10
              flex-wrap
              items-center
              justify-between
              text-[11px]
              uppercase
              tracking-widest

              ml-3
              mr-3

              sm:ml-20
              sm:mr-20
              sm:text-xs

              max-sm:gap-2
              max-sm:text-[10px]
              max-sm:tracking-[0.12em]
            "
          >

            <div>

              <p className="font-bold text-blood">
                Web Developer
              </p>

              <p className="text-smoke">
                Digital Creator
              </p>

            </div>

            <div className="mr-0 flex items-center gap-1 text-bone sm:mr-2">

              {statusText}

              <span className="text-blood">
                ✦
              </span>

            </div>

          </div>

          {/* ================================================= */}
          {/* HERO */}
          {/* ================================================= */}

          <div className="flex">

            {/* ================================================= */}
            {/* INTRO */}
            {/* ================================================= */}

            <div
              className="
                mx-auto
                grid
                h-45
                w-45
                max-w-6xl
                grid-cols-1
                gap-8
                pb-10

                sm:-mt-28

                lg:grid-cols-[1fr_1.1fr]
                lg:items-end
                lg:gap-4
              "
            >

              <Reveal
                className="
                  relative
                  z-10
                  order-2
                  flex
                  flex-col
                  justify-end

                  lg:order-1
                  lg:pb-10
                "
              >

                {/* HELLO */}

                <p
                  className="
                    text-lg
                    text-bone/90

                    sm:text-4xl

                    max-[375px]:text-[15px]
                  "
                  style={{
                    fontFamily: '"Dancing Script", cursive',
                  }}
                >
                  Hello, I'm
                </p>

                {/* NAME */}

                <h1
                  className="
                    font-display
                    text-4xl
                    leading-[0.95]
                    text-bone

                    sm:text-6xl

                    max-[375px]:text-[32px]
                  "
                >
                  SINOO

                  <br />

                  SF
                </h1>

                {/* TITLE */}

                <p
                  className="
                    mt-4
                    font-display
                    text-sm
                    text-blood

                    sm:text-base

                    max-[375px]:mt-3
                    max-[375px]:text-[11px]
                  "
                >
                  WEB DEVELOPER &amp; UI/UX CREATOR
                </p>

                {/* DESCRIPTION */}

                <p
                  className="
                    mt-4
                    max-w-sm
                    text-sm
                    leading-relaxed
                    text-smoke

                    max-[375px]:mt-3
                    max-[375px]:max-w-[210px]
                    max-[375px]:text-[11px]
                    max-[375px]:leading-[1.45]
                  "
                >
                  I design and build stylish, user-focused web experiences that combine
                  creativity with strategy. Passionate about clean design, smooth
                  interactions, and details that make <br />
                  a difference.
                </p>

                {/* ================================================= */}
                {/* BUTTONS */}
                {/* ================================================= */}

                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    items-center
                    gap-4

                    max-[375px]:mt-4
                    max-[375px]:gap-3
                  "
                >

                  <button
                    onClick={onOpenContact}
                    className="
                      group
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-blood
                      px-6
                      py-3
                      text-sm
                      font-semibold
                      text-bone
                      transition-all
                      duration-200
                      hover:bg-blood-dim
                      hover:shadow-[0_0_0_4px_rgba(216,28,47,0.25)]
                      active:scale-95

                      max-[375px]:gap-1.5
                      max-[375px]:px-5
                      max-[375px]:py-2.5
                      max-[375px]:text-[11px]
                    "
                  >

                    Contact Me

                    <ShareNetwork
                      size={18}
                      weight="bold"
                      className="
                        transition-transform
                        duration-200
                        group-hover:rotate-12

                        max-[375px]:h-4
                        max-[375px]:w-4
                      "
                    />

                  </button>

                  <span
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      uppercase
                      tracking-wide
                      text-smoke

                      max-[375px]:gap-1.5
                      max-[375px]:text-[9px]
                    "
                  >

                    <Globe
                      size={16}
                      className="
                        text-blood

                        max-[375px]:h-3.5
                        max-[375px]:w-3.5
                      "
                    />

                    Available Worldwide

                  </span>

                </div>

              </Reveal>

            </div>

            {/* ================================================= */}
            {/* STATS */}
            {/* ================================================= */}

            <Reveal
            delay={150}
            className="
              z-10
              mx-auto
              mb-16
              grid
              max-w-6xl
              content-end
              gap-3

              sm:justify-end

              max-sm:ml-auto
              max-sm:mr-2
              max-sm:mb-10
              max-sm:w-[125px]
              max-sm:gap-1

              /* iPad / tablet fix */
              min-[768px]:max-[1024px]:mr-8
              min-[768px]:max-[1024px]:mb-14
              min-[768px]:max-[1024px]:w-[180px]
              min-[768px]:max-[1024px]:gap-2
            "
          >
  {stats.map((stat, index) => (

    <div
      key={index}
      className="w-full"
    >

      {/* STAT CONTENT */}

      <div
        className="
          mt-1
          flex
          items-center
          gap-1.5
          text-left

          sm:h-12
          sm:flex-nowrap
          sm:gap-2

          max-sm:min-h-[36px]

          /* iPad / tablet */
          min-[768px]:max-[1024px]:h-auto
          min-[768px]:max-[1024px]:min-h-[48px]
          min-[768px]:max-[1024px]:gap-2
        "
      >

        {/* NUMBER */}

        <p
          className={`
            shrink-0
            font-display
            text-2xl
            text-blood
            sm:text-4xl

            ${
              index === stats.length - 1
                ? 'max-sm:text-[34px]'
                : 'max-sm:text-[20px]'
            }

            /* iPad / tablet */
            min-[768px]:max-[1024px]:text-[32px]
          `}
        >
          {stat.value}
        </p>

        {/* LABEL */}

        <p
          className="
            min-w-0
            whitespace-nowrap
            text-[11px]
            uppercase
            tracking-wide
            text-smoke

            max-sm:text-[8px]
            max-sm:leading-[1.2]

            /* iPad / tablet */
            min-[768px]:max-[1024px]:text-[10px]
            min-[768px]:max-[1024px]:leading-[1.25]
          "
        >
          {stat.label}
        </p>

      </div>

      {/* LINE */}

      {index < stats.length - 1 && (

        <div
              className="
                h-[0.1px]
                w-full
                bg-white
                opacity-[0.2]

                max-sm:mt-0.5
              "
            />

          )}

        </div>

      ))}
            </Reveal>

          </div>

        </div>

      </div>

    </header>

  );
}