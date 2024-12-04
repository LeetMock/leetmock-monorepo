def time_diff_in_minutes(timestamp1, timestamp2):
    """
    Calculate the difference between two timestamps in minutes.

    :param timestamp1: First timestamp in milliseconds since epoch
    :param timestamp2: Second timestamp in milliseconds since epoch
    :return: Difference in minutes (absolute value)
    """
    # Convert timestamps from milliseconds to seconds
    time1_seconds = timestamp1 / 1000
    time2_seconds = timestamp2 / 1000

    # Calculate the difference in seconds
    difference_seconds = abs(time1_seconds - time2_seconds)

    # Convert the difference to minutes
    difference_minutes = difference_seconds / 60

    return difference_minutes
