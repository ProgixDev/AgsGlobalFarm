# Development Report — UI Fixes, PDF & Dependencies

**Date:** 27 April 2026  
**Project:** Application — AGS Mobile  
**Prepared by:** Islem

---

## Work Completed

### 1. UI Bugs — Major & Minor Fixes

A large number of visual and layout issues were identified and resolved across multiple screens.

Fixes include:

- Fixed tab bar crowding — switched to icon-only floating tab bar with animated active indicator
- Fixed status bar and navigation bar visibility — both were hidden unintentionally, now restored with proper insets
- Fixed scroll content going behind the bottom navigation bar — added `useTabBarInset()` hook used across all scroll containers
- Fixed course cards in the Formation screen — images now stretch correctly to match content height with no white space
- Fixed product cards in the Shop screen — images now track content height dynamically via `onLayout`
- Fixed broken product images in the Shop — replaced dead Unsplash URLs and added category-specific fallback images
- Fixed stock badge positioning in Shop cards — moved to a cleaner inline dot + text layout below the price
- Fixed region sheet on the Map — now opens fully expanded on region tap instead of staying minimized
- Fixed sheet dismiss behavior on Map — swipe down now closes the sheet completely with no intermediate minimized state
- Removed sort filter UI from the Shop screen

---

### 2. PDF Functionality — Fixes & Enhancements

The PDF export feature was unstable and failing inconsistently. The functionality has been debugged and stabilized.

Work done:

- Identified root causes of random PDF generation failures
- Fixed rendering and data formatting issues affecting output consistency
- Enhanced the PDF output quality and structure
- Validated the full flow from data input to file export
- Feature is now stable across test cases

---

### 3. Dependencies & Build Issues

Multiple build failures were blocking mobile testing and development progress. All identified dependency issues have been resolved.

Work done:

- Audited and resolved conflicting or broken package dependencies
- Fixed compilation errors preventing the app from building correctly
- Verified the app builds and runs correctly on physical device
- Unblocked mobile testing for all recent feature work

---


